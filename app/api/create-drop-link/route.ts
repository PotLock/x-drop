import { NextApiRequest, NextApiResponse } from 'next';
import * as nearAPI from 'near-api-js';
import { generateAddress } from '@/app/lib/kdf'; // Assuming you have this utility function
import { getAccount, contractCall } from '@/app/lib/near-provider'; // Adjust the import path as needed
import dotenv from 'dotenv';

dotenv.config();

const {
  REACT_APP_contractId: contractId,
  REACT_APP_MPC_PUBLIC_KEY: MPC_PUBLIC_KEY,
  REACT_APP_MPC_PATH: MPC_PATH,
} = process.env;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, chain, twitterAccount } = req.body;

  if (!amount || !chain || !twitterAccount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const account = getAccount(contractId);
    const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
    const publicKey = keyPair.getPublicKey().toString();

    const { address: recipientAddress, publicKey: recipientPublicKey } = await generateAddress({
      publicKey: MPC_PUBLIC_KEY,
      accountId: contractId,
      path: MPC_PATH,
      chain: chain,
    });

    const dropId = `drop-${Date.now()}`;
    await contractCall({
      contractId,
      methodName: 'add_drop',
      args: {
        drop_id: dropId,
        amount: amount.toString(),
        recipient: recipientAddress,
        funder: recipientPublicKey,
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
    res.status(200).json({ dropLink });
  } catch (error) {
    console.error('Error creating drop link:', error);
    res.status(500).json({ error: 'Failed to create drop link' });
  }
}