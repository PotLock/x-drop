import { Scraper, SearchMode } from "agent-twitter-client";
import dotenv from "dotenv";
import puppeteer from 'puppeteer';

dotenv.config();

function cookiesToArray(cookieString: string): string[] {
    return cookieString.split(";").map(cookie => cookie.trim());
}

async function replyToTweet(username: string, tweetId: string, replyMessage: string) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const cookiesString = process.env.TWITTER_COOKIES;
    if (!cookiesString) {
        console.error('Error: Missing environment variable (TWITTER_COOKIES)');
        return;
    }

    const cookies = cookiesString.split('; ').map(cookie => {
        const [name, value] = cookie.split('=');
        return { name, value, domain: '.x.com' };
    });
    await page.setCookie(...cookies);
    await page.goto('https://x.com');
    await page.goto(`https://x.com/${username}/status/${tweetId}`);

    // Wait for the reply button to be visible and click it
    await page.waitForSelector('div[data-testid="tweetTextarea_0RichTextInputContainer"]');
    await page.click('div[data-testid="tweetTextarea_0RichTextInputContainer"]');
    // Wait for the reply text area to be visible and type the reply message
    await page.type('div[data-testid="tweetTextarea_0RichTextInputContainer"]', replyMessage, { delay: 400 });
    // Click the reply button to post the reply
    await page.waitForSelector('div[data-testid="tweetTextarea_0RichTextInputContainer"]');

    await page.click('button[data-testid="tweetButtonInline"]');

    await browser.close();
}

async function sendDirectMessageOrNotify(scraper: Scraper, recipient: string, message: string, tweetId: string) {
    try {
        await scraper.sendDirectMessage(recipient, message);
        console.log(`[DM Sent] @${recipient}: ${message}`);
    } catch (error: any) {
        console.error(`[DM Failed] @${recipient}:`, error);

        if (error?.errors?.some((e: any) => e.code === 279)) {
            const replyMessage = `Hey @${recipient}, please send me a DM so I can message you back!`;
            await scraper.sendTweet(replyMessage, tweetId);
            console.log(`[Public Reply Sent] Asking @${recipient} to DM first.`);
        }
    }
}

async function continuouslyCheckMentions(interval = 60000) {
    const scraper = new Scraper();
    const cookieString = process.env.TWITTER_COOKIES;
    const twitterUsername = process.env.TWITTER_USERNAME;

    if (!cookieString || !twitterUsername) {
        console.error("Error: Missing environment variables (TWITTER_COOKIES or TWITTER_USERNAME)");
        return;
    }
    await scraper.setCookies(cookiesToArray(cookieString));
    const bot = await scraper.me();
    const botId = bot?.userId;
    let lastSeenTweetId: string | null = null;
    console.log("[Monitoring] Started listening for mentions...");

    while (true) {
        try {
            const query = `@${twitterUsername}`;
            const tweets = [];
            for await (const tweet of scraper.searchTweets(query, 5, SearchMode.Latest)) {
                tweets.push(tweet);
            }

            if (tweets.length === 0) {
                await new Promise(resolve => setTimeout(resolve, interval));
                continue;
            }

            tweets.sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id));

            const newMentions: any = lastSeenTweetId
                ? tweets.filter((tweet: any) => parseInt(tweet.id) > parseInt(lastSeenTweetId as string))
                : tweets;

            if (newMentions.length === 0) {
                await new Promise(resolve => setTimeout(resolve, interval));
                continue;
            }

            console.log(`[New Mentions] ${newMentions.length} tweets detected.`);

            const mentionRegex = /@\w+\s+!(\w+)\s+(\d+)/;

            for (const tweet of newMentions) {
                const cleanedText = tweet.text.replace(/\n/g, " ").trim();
                const match = cleanedText.match(mentionRegex);

                if (!match) continue;

                const [_, command, amount] = match;
                const userMention = tweet.username;

                if (!tweet.inReplyToStatusId) {
                    console.log(`[Ignoring] Tweet is not a reply: @${userMention}`);
                    continue;
                }

                const inReplyToStatusId = tweet.inReplyToStatusId;
                try {
                    const originalTweet: any = await scraper.getTweet(inReplyToStatusId);

                    if (!originalTweet) {
                        console.error("[Error] Failed to fetch original tweet.");
                        continue;
                    }

                    console.log(`[Original Tweet] From @${originalTweet.username}: ${originalTweet.text}`);

                    if (originalTweet.username !== userMention) {
                        const userMentionProfile = await scraper.getProfile(originalTweet.username);
                        if (!userMentionProfile.isBlueVerified) {
                            console.log(`[Processing] Reply to tweet ID: ${tweet.id}`);
                            await replyToTweet(tweet.username, tweet.id, "Cannot send messenger to unverified users");
                        } else {
                            const conversionId = `${originalTweet.userId}-${botId}`;
                            console.log(`[Processing] Send Message to Conversion ID: ${conversionId}`);
                            await sendDirectMessageOrNotify(scraper, conversionId, "gm", originalTweet.id);
                        }
                    } else {
                        console.log(`[Processing] Reply to tweet ID: ${tweet.id}`);
                       // await replyToTweet(tweet.username, tweet.id, "Cannot transfer to yourself");
                    }
                } catch (error) {
                    console.error("[Error] Fetching original tweet:", error);
                }
            }

            lastSeenTweetId = newMentions[0].id;
        } catch (error) {
            console.error("[Error] Checking mentions:", error);
        }

        await new Promise(resolve => setTimeout(resolve, interval));
    }
}

continuouslyCheckMentions();
