import { Scraper } from 'agent-twitter-client';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Starting Twitter scraper bot...');
    const scraper = new Scraper();
    // v1 login
    try {
        const cookies = await scraper.getCookies();
        if (cookies[0]) {
            await scraper.clearCookies();
            console.log('Already logged in!');
            return
        }
        // Clear current cookies
        await scraper.clearCookies();
        await scraper.login(
            process.env.TWITTER_USERNAME!,
            process.env.TWITTER_PASSWORD!,
            process.env.TWITTER_EMAIL!,
            process.env.TWITTER_2FA_SECRET!,
        );
        console.log('Logged in successfully!');
    } catch (error) {
        console.error('Error logging in:', error);
    }


    // Example: Posting a new tweet with a poll
    //  scraper.sendDirectMessage('kurodenjiro', 'Hello, this is a test message from the Twitter scraper bot!')

}

main().catch(console.error);