import * as nearAPI from 'near-api-js';
import { contractCall } from '@/lib/near-provider'; // Adjust the import path as needed
import dotenv from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';
import { generateSeedPhrase } from 'near-seed-phrase';
const { KeyPair } = nearAPI;
import { Buffer } from 'buffer';

dotenv.config();

const {
    REACT_APP_contractId: contractId,
    REACT_APP_MPC_PUBLIC_KEY: MPC_PUBLIC_KEY,
    REACT_APP_MPC_PATH: MPC_PATH,
    NEXT_PUBLIC_URL,
} = process.env;

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { amount, chain, twitterAccount, btcPublicKey } = body;

    if (!amount || !chain || !twitterAccount || !btcPublicKey) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        // to create a seed phrase with its corresponding Keys
        const { secretKey: dropSecret } = generateSeedPhrase();
        const dropKeyPair = KeyPair.fromString(dropSecret as any);


        const dropId = await contractCall({
            contractId,
            methodName: 'add_drop',
            args: {
                target: 1,
                amount: amount, // Sats
                funder: btcPublicKey,
                path: MPC_PATH,
            },
        });
        // how to know drop id after created?
        await contractCall({
            contractId,
            methodName: 'add_drop_key',
            args: {
                drop_id: dropId,
                key: dropKeyPair.getPublicKey().toString(),
            },
        });
        console.log('Drop key added', dropKeyPair);
        const dropKeyPairBase64 = Buffer.from(dropSecret).toString('base64');

        const dropLink = `${NEXT_PUBLIC_URL}/claim/${dropId}?key=${dropKeyPairBase64}`;
        return NextResponse.json({ dropLink: dropLink }, { status: 200 });
    } catch (error) {
        console.error('Error creating drop link:', error);
        return NextResponse.json({ error: 'Failed to create drop link' }, { status: 500 });
    }
}