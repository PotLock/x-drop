"use client"

import { useState, useEffect } from "react";
import * as nearAPI from "near-api-js";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { generateAddress } from "@/app/lib/kdf"; // Assuming you have this utility function
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MIN_SATS = 546;
const MPC_PUBLIC_KEY = process.env.NEXT_PUBLIC_MPC_PUBLIC_KEY;
const MPC_PATH = process.env.NEXT_PUBLIC_MPC_PATH;

if (!MPC_PUBLIC_KEY || !MPC_PATH) {
    console.error("MPC_PUBLIC_KEY or MPC_PATH is not set in environment variables");
}

export default function CreateDropLink() {
    const [amount, setAmount] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [recipientPublicKey, setRecipientPublicKey] = useState("");
    const [dropLink, setDropLink] = useState("");
    const [chain, setChain] = useState("bitcoin");
    const [twitterAccount, setTwitterAccount] = useState("");
    const { isLoggedIn, currentAccountId, addDrop, addDropKey } = useContractInteraction();

    useEffect(() => {
        if (isLoggedIn) {
            generateAddressForChain();
        }
    }, [isLoggedIn, chain]);

    const generateAddressForChain = async () => {
        if (!isLoggedIn || !MPC_PUBLIC_KEY || !MPC_PATH) return;

        try {
            const { address, publicKey } = await generateAddress({
                publicKey: MPC_PUBLIC_KEY,
                accountId: currentAccountId || "",
                path: MPC_PATH,
                chain: chain,
            });

            setRecipientAddress(address || "");
            setRecipientPublicKey(publicKey);
        } catch (error) {
            console.error("Error generating address:", error);
            toast({
                title: "Error",
                description: `Failed to generate ${chain} address. Please try again.`,
                variant: "destructive",
            });
        }
    };

    const createDropLink = async () => {
        if (!isLoggedIn) {
            toast({
                title: "Not signed in",
                description: "Please sign in to your NEAR wallet first.",
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

        if (!recipientAddress || !recipientPublicKey) {
            toast({
                title: "Invalid recipient",
                description: `Failed to generate a ${chain} address. Please try again.`,
                variant: "destructive",
            });
            return;
        }

        try {
            const keyPair = nearAPI.KeyPair.fromRandom("ed25519");
            const publicKey = keyPair.getPublicKey().toString();

            const dropId = `drop-${Date.now()}`;
            await addDrop(currentAccountId, dropId, satsAmount, recipientAddress, recipientPublicKey, MPC_PATH as string);
            await addDropKey(currentAccountId, dropId, publicKey);

            setDropLink(`https://linkdrop.testnet/drop/${dropId}`);
            toast({
                title: "Success",
                description: "Drop link created successfully.",
                variant: "default",
            });
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
                <Button onClick={createDropLink} className="w-full">
                    Create Drop Link
                </Button>
                {dropLink && (
                    <div className="p-4 bg-secondary rounded-md break-all">
                        <p className="text-sm font-medium mb-2">Your Drop Link:</p>
                        <p className="font-mono text-xs">{dropLink}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}

