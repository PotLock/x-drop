'use client'

import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Wallet } from "./near-wallet";
import { useWeb3Auth } from "./web3auth-context";
import { connect, keyStores, utils } from "near-api-js";

const Contract = "hello.near-examples.testnet";
const NetworkId = "testnet";

interface NearContextType {
  wallet: Wallet | undefined;
  signedAccountId: string;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const NearContext = createContext<NearContextType>({
  wallet: undefined,
  signedAccountId: "",
  isLoading: false,
  error: null,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

interface NearProviderProps {
  children: ReactNode;
}

export function NearProvider({ children }: NearProviderProps) {
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [signedAccountId, setSignedAccountId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { loginWithProvider, logout: web3authLogout, accountId: web3AuthAccountId } = useWeb3Auth();

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Login with Web3Auth using Google
      await loginWithProvider("google");
      
      // If we have a Web3Auth account ID, use that
      if (web3AuthAccountId) {
        setSignedAccountId(web3AuthAccountId);
      }
      
    } catch (error: any) {
      setError(error.message || "Failed to login with Google");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Logout from Web3Auth
      await web3authLogout();
      
      // Clear local state
      setSignedAccountId("");
      
    } catch (error: any) {
      setError(error.message || "Failed to logout");
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initWallet = async () => {
      try {
        const newWallet = new Wallet({
          createAccessKeyFor: Contract as string | undefined,
          networkId: NetworkId,
        });

        const accountId = await newWallet.startUp((signedAccountId: string | undefined) => {
          setSignedAccountId(signedAccountId || "");
        });

        setWallet(newWallet);
        if (!web3AuthAccountId) {
          setSignedAccountId(accountId || "");
        }
      } catch (error: any) {
        console.error("Wallet initialization error:", error);
        setError(error.message || "Failed to initialize wallet");
      }
    };

    initWallet();
  }, [web3AuthAccountId]);

  return (
    <NearContext.Provider value={{ 
      wallet, 
      signedAccountId, 
      isLoading, 
      error,
      loginWithGoogle,
      logout
    }}>
      {children}
    </NearContext.Provider>
  );
}

export function useNear(): NearContextType {
  return useContext(NearContext);
} 