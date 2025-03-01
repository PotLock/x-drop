"use client"

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { connect, keyStores, WalletConnection, KeyPair, Account, Near, } from "near-api-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { getBalance, getChange, broadcast } from "@/app/(dashboard)/lib/bitcoin";
import { Input } from "@/components/ui/input";
import { Label } from "recharts";

import {
  setAccessKey,
  contractCall,
} from './near-provider';


export default function ClaimDrop() {
  const params = useParams();
  const { key } = params;
  const [dropInfo, setDropInfo] = useState<any>(null);
  const [secretKey, setSecretKey] = useState<string | null>(key ? atob(decodeURIComponent(key as string)) : null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<string>("mgMK97mK1ZJGgoWoQc6dqHoEpfbn88SYw4");
  const [errorMsg, setErrorMsg] = useState<string>("");


  useEffect(() => {
    const checkLink = async () => {
      const isSet = await setAccessKey(secretKey);
      if (!isSet) {
        setErrorMsg('Link is invalid or already used');
      }
    }
    if (secretKey) {
      checkLink()
    }
  }, [secretKey]);
  const claim = async () => {
    setIsLoading(true)
    const DROP_SATS = 546;
    const contractId = 'satisfying-bell.testnet';
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
    console.log('utxos', utxos);
    funderTxId = utxos[0].txid;


    dropChange = await getChange({
      balance: funderBalance,
      sats: DROP_SATS,
    });

    console.log('claimingAddress', address);
    console.log('funderAddress', address);
    console.log('funderTxId', funderTxId);
    console.log(`funderBalance ${funderBalance}`);
    console.log('dropChange', dropChange);

    try {

      const res = await contractCall({
        contractId: contractId as any,
        methodName: 'claim',
        args: {
          txid_str: funderTxId, // Replace with actual funderTxId
          vout: utxos[0].vout, // Replace with actual funderUtxoOut
          receiver: address, // Replace with actual funderAddress
          change: dropChange.toString(), // Replace with actual dropChange
        },
      });
      console.log('Claim result:', res);

      setDropInfo(res);
    } catch (error) {

    }
    setIsLoading(false);
  }
  return (
    <div className="flex justify-center items-center mt-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Claim Drop</CardTitle>
          <CardDescription>Claim your drop using the secret key.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg ?
            <div>
              <p className="text-red ">{errorMsg} </p>
            </div>
            : <>
              <div className="space-y-2">
                <Label >Bitcoin Address</Label>
                <Input
                  id="bitcoinAddress"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your Bitcoin address"
                />
              </div>

              <div className="flex justify-start mt-3">
                <Button onClick={claim} disabled={!secretKey || !address || isLoading}  >
                  Claim Drop
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : ""}
                </Button>
              </div>

              {dropInfo && (
                <div>
                  <p>Drop Info: {JSON.stringify(dropInfo)}</p>
                </div>
              )}

            </>
          }
        </CardContent>
      </Card>
    </div>
  );
}