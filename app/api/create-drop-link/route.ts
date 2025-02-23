import { NextApiRequest, NextApiResponse } from 'next';
import * as nearAPI from 'near-api-js';
import { generateAddress } from '@/lib/kdf'; // Assuming you have this utility function
import { getAccount, contractCall } from '@/lib/near-provider'; // Adjust the import path as needed
import dotenv from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';

dotenv.config();

const {
    REACT_APP_contractId: contractId,
    REACT_APP_MPC_PUBLIC_KEY: MPC_PUBLIC_KEY,
    REACT_APP_MPC_PATH: MPC_PATH,
} = process.env;

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { amount, chain, twitterAccount, btcPublicKey } = body;

    if (!amount || !chain || !twitterAccount || !btcPublicKey) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
        const publicKey = keyPair.getPublicKey().toString();


        const dropId = `drop-${Date.now()}`;
        await contractCall({
            contractId,
            methodName: 'add_drop',
            args: {
                target: 1,
                drop_id: dropId,
                amount: amount.toString(), // Sats
                funder: btcPublicKey,
                path: MPC_PATH,
            },
        });

        await contractCall({
            contractId,
            methodName: 'add_drop_key',
            args: {
                drop_id: dropId,
                key: publicKey,
            },
        });

        const dropLink = `https://linkdrop.testnet/drop/${dropId}`;
        return NextResponse.json({ dropLink }, { status: 200 });
    } catch (error) {
        console.error('Error creating drop link:', error);
        return NextResponse.json({ error: 'Failed to create drop link' }, { status: 500 });
    }
}