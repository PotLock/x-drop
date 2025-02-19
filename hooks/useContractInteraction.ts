import { useWeb3Auth } from '@/context/web3auth-context';
import { useNear } from '@/context/near-context';
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
  const { wallet, signedAccountId } = useNear();


  const setSocial = async () => {
    const STORAGE_DEPOSIT = "0.1"; // 0.1 NEAR for storage deposit

    // If using Web3Auth
    if (web3auth?.connected && nearConnection && web3authAccountId) {
      const account: Account = await nearConnection.account(web3authAccountId);
      return account.functionCall({
        contractId: "v1.social08.testnet",
        methodName: "set",
        args: {
          data: {
            [web3authAccountId]: {
              profile: {
                name: "Alice",
              },
            },
          },
        },
        gas: BigInt(100000000000000),
        attachedDeposit: BigInt(parseFloat(STORAGE_DEPOSIT) * 1e24) // Convert NEAR to yoctoNEAR
      });
    }
    
    // If using NEAR Wallet
    if (signedAccountId && wallet) {
      return wallet.callMethod({
        contractId: "v1.social08.testnet",
        method: "set",
        args: {
          data: {
            [signedAccountId]: {
              profile: {
                name: "Alice",
              },
            },
          },
        },
        gas: "100000000000000",
        deposit: STORAGE_DEPOSIT
      });
    }
  }

  const getGreeting = async (): Promise<string> => {
    try {
      const viewContract = async ({ contractId, methodName, args = {} }: ViewContractParams): Promise<string> => {
        const url = `https://rpc.testnet.near.org`;
        const provider = new providers.JsonRpcProvider({ url });
        
        const argsBase64 = args
          ? Buffer.from(JSON.stringify(args)).toString("base64")
          : "";

        const viewCallResult = (await provider.query({
          request_type: "call_function",
          account_id: contractId,
          method_name: methodName,
          args_base64: argsBase64,
          finality: "optimistic",
        })) as QueryResult;

        return JSON.parse(Buffer.from(viewCallResult.result[0]).toString());
      };

      const result = await viewContract({
        contractId: "hello.near-examples.testnet",
        methodName: "get_greeting",
      });
      
      return result;
    } catch (error) {
      console.error("Error getting greeting:", error);
      throw error;
    }
  };

  const setGreeting = async (newGreeting: string) => {
    if (!newGreeting?.trim()) {
      throw new Error('Please enter a greeting');
    }

    // If using Web3Auth
    if (web3auth?.connected && nearConnection && web3authAccountId) {
      const account: Account = await nearConnection.account(web3authAccountId);
      return account.functionCall({
        contractId: "hello.near-examples.testnet",
        methodName: "set_greeting",
        args: {
          greeting: newGreeting
        },
        gas: BigInt(100000000000000)
      });
    }
    
    // If using NEAR Wallet
    if (signedAccountId && wallet) {
      return wallet.callMethod({
        contractId: "hello.near-examples.testnet",
        method: "set_greeting",
        args: {
          greeting: newGreeting
        }
      });
    }

    throw new Error('Please connect your wallet first');
  };

  return {
    getGreeting,
    setGreeting,
    setSocial,
    isLoggedIn: web3auth?.connected || !!signedAccountId,
    currentAccountId: signedAccountId || web3authAccountId
  };
} 