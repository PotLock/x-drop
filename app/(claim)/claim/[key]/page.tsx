"use client"

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { connect, keyStores, WalletConnection, KeyPair, Account, Near } from "near-api-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { getBalance, getChange } from "@/app/lib/bitcoin";
import { Input } from "@/components/ui/input";
import { Label } from "recharts";

// NEAR testnet configuration
const config = {
  networkId: "testnet",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

const near = new Near(config);
const { connection } = near;
const { provider } = connection;
const {  REACT_APP_contractId } = process.env;
const contractId = REACT_APP_contractId || "";

export const getAccount = (id = contractId) => new Account(connection, id as any);

export default function ClaimDrop() {
  const params = useParams();
  const { key } = params;
  const [near, setNear] = useState<any>(null);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [dropInfo, setDropInfo] = useState<any>(null);
  const [secretKey, setSecretKey] = useState<string | null>(key ? atob(key as string) : null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    initNear();
  }, []);

  // Initialize NEAR connection
  const initNear = async () => {
    try {
      const nearConnection = await connect(config);
      const walletConnection = new WalletConnection(nearConnection, "near-bitcoin-linkdrop");
      setNear(nearConnection);
      setWallet(walletConnection);

      if (walletConnection.isSignedIn()) {
        fetchDropInfo();
      }

      if (secretKey) {
        const dropKeyPair = KeyPair.fromString(secretKey as any);
        const networkId = config.networkId;
        await config.keyStore.setKey(networkId, contractId, dropKeyPair);
      }
    } catch (error) {
      console.error("Error initializing NEAR:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to NEAR network.",
        variant: "destructive",
      });
    }
  };

  // Fetch drop information
  const fetchDropInfo = async () => {
    if (!wallet || !params.dropId) return;

    try {
      setIsLoading(true);
      // Fetch drop information logic here
      // ...
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch drop information:', error);
      setIsLoading(false);
    }
  };

  const claim = async () => {
    const account = getAccount(contractId);
    const DROP_SATS = 546;
    let funderBalance = null;
    let funderTxId = null;
    let dropChange = null;

    // address BTC 
    funderBalance = await getBalance({
      address: address,
    });

    const utxos = await getBalance({
      address: address,
      getUtxos: true,
    });
    funderTxId = utxos[0].txid;

    console.log();

    dropChange = await getChange({
      balance: funderBalance,
      sats: DROP_SATS,
    });

    console.log('claimingAddress', address);
    console.log('funderAddress', address);
    console.log('funderTxId', funderTxId);
    console.log(`funderBalance ${funderBalance}`);
    console.log('dropChange', dropChange);


    const res = await account.functionCall({
      contractId,
      methodName: 'claim',
      args: {
        txid_str: funderTxId, // Replace with actual funderTxId
        vout: utxos[0].vout, // Replace with actual funderUtxoOut
        receiver: address, // Replace with actual funderAddress
        change: dropChange.toString(), // Replace with actual dropChange
      },
    });

    console.log('Claim result:', res);
  }
  return (
    <div className="flex justify-center items-center mt-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Claim Drop</CardTitle>
          <CardDescription>Claim your drop using the secret key.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label >Bitcoin Address</Label>
            <Input
              id="bitcoinAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your Bitcoin address"
            />
          </div>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div className="flex justify-start mt-3">
              <Button onClick={claim} disabled={!secretKey || !wallet || !address}>
                Claim Drop
              </Button>
            </div>
          )}
          {dropInfo && (
            <div>
              <p>Drop ID: </p>
              <p>Drop Info: {JSON.stringify(dropInfo)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}