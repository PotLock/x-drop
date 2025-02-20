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


  return {
    isLoggedIn: web3auth?.connected,
    currentAccountId: web3authAccountId
  };
} 