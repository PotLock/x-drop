import { useWeb3Auth } from '@/context/web3auth-context';
import { providers, Account } from 'near-api-js';


interface ViewContractParams {
  contractId: string;
  methodName: string;
  args?: Record<string, unknown>;
}

interface QueryResult {
  result: Uint8Array[];
  block_height: number;
  block_hash: string;
}

export function useContractInteraction() {
  const { web3auth, nearConnection, accountId: web3authAccountId } = useWeb3Auth();

  const addDrop = async (account: any, dropId: string, satsAmount: number, recipientAddress: string, recipientPublicKey: string, MPC_PATH: string) => {
    if (web3auth?.connected && nearConnection && web3authAccountId) {
      const account: Account = await nearConnection.account(web3authAccountId);
      return account.functionCall({
        contractId: "linkdrop.testnet", // Replace with your actual contract ID
        methodName: "add_drop",
        args: {
          drop_id: dropId,
          amount: satsAmount.toString(),
          recipient: recipientAddress,
          funder: recipientPublicKey,
          path: MPC_PATH,
        },
        gas: BigInt("300000000000000"), // Adjust the gas as needed
      });
    }
  }

  const addDropKey = async (account: any, dropId: string, publicKey: string) => {
    if (web3auth?.connected && nearConnection && web3authAccountId) {
      const account: Account = await nearConnection.account(web3authAccountId);
      return account.functionCall({
        contractId: "linkdrop.testnet", // Replace with your actual contract ID
        methodName: "add_drop_key",
        args: {
          drop_id: dropId,
          key: publicKey,
        },
        gas: BigInt("300000000000000"), // Adjust the gas as needed
      });
    }
  }


  return {
    addDrop,
    addDropKey,
    isLoggedIn: web3auth?.connected,
    currentAccountId: web3authAccountId
  };
} 