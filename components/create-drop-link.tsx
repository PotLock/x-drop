"use client"

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const MIN_SATS = 546;

export default function CreateDropLink({ user }: { user: any }) {
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState("bitcoin");
  const [twitterAccount, setTwitterAccount] = useState("");
  const [dropLink, setDropLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createDropLink = async () => {
    if (!amount || !chain || !twitterAccount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const satsAmount = Number.parseInt(amount);
    if (isNaN(satsAmount) || satsAmount < MIN_SATS) {
      toast({
        title: "Invalid amount",
        description: `Amount must be at least ${MIN_SATS} satoshis.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/create-drop-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: satsAmount, chain, twitterAccount , btcPublicKey: user.btcPublicKey}),
      });

      const data = await response.json();
      if (response.ok) {
        setDropLink(data.dropLink);
        toast({
          title: "Success",
          description: "Drop link created successfully.",
          variant: "default",
        });
        setIsLoading(false);

      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error creating drop link:", error);
      toast({
        title: "Error",
        description: "Failed to create drop link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Create Drop Link</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (in satoshis)</Label>
          <Input
            id="amount"
            type="number"
            placeholder={MIN_SATS.toString()}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={MIN_SATS}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chain">Chain</Label>
          <select
            id="chain"
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="bitcoin">Bitcoin</option>
            <option value="evm">EVM</option>
            <option value="near">NEAR</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterAccount">Twitter Account</Label>
          <Input
            id="twitterAccount"
            value={twitterAccount}
            onChange={(e) => setTwitterAccount(e.target.value)}
            placeholder="Enter Twitter account"
          />
        </div>

        <Button onClick={createDropLink} disabled={isLoading} className="w-full">
        {isLoading ? 'Loading...' : 'Create Drop Link'}
        </Button>
        {dropLink && (
          <div className="p-4 bg-secondary rounded-md break-all">
            <p className="text-sm font-medium mb-2">Your Drop Link:</p>
            <p className="font-mono text-xs">{dropLink}</p>
          </div>
        )}
      </div>
      <Link href="/" className="text-blue-500 underline mt-4 inline-block">Return to Home</Link>
    </Card>
  );
}

