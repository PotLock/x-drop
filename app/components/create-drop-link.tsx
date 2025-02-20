"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import * as nearAPI from "near-api-js"
import { generateAddress } from "@/app/lib/kdf"
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { useWeb3Auth } from "@/context/web3auth-context"



// Minimum amount of satoshis for a valid Bitcoin transaction
const MIN_SATS = 546

// MPC configuration
const MPC_PUBLIC_KEY = process.env.NEXT_PUBLIC_MPC_PUBLIC_KEY
const MPC_PATH = process.env.NEXT_PUBLIC_MPC_PATH

if (!MPC_PUBLIC_KEY || !MPC_PATH) {
    console.error("MPC_PUBLIC_KEY or MPC_PATH is not set in environment variables")
}

export default function CreateDropLink() {
    const [amount, setAmount] = useState("")
    const [recipientAddress, setRecipientAddress] = useState("")
    const [recipientPublicKey, setRecipientPublicKey] = useState("")
    const [dropLink, setDropLink] = useState("")
    const { isLoggedIn, currentAccountId } = useContractInteraction();

    const { web3auth, nearConnection, accountId: web3authAccountId } = useWeb3Auth();

    useEffect(() => {
        if (isLoggedIn) {
            generateBitcoinAddress()
        }
    }, [isLoggedIn])


    // Generate a Bitcoin address using KDF
    const generateBitcoinAddress = async () => {
        if (!isLoggedIn || !MPC_PUBLIC_KEY || !MPC_PATH) return

        try {
            const { address, publicKey } = await generateAddress({
                publicKey: MPC_PUBLIC_KEY,
                accountId: currentAccountId || "",
                path: MPC_PATH,
                chain: "bitcoin",
            })

            setRecipientAddress(address || "")
            setRecipientPublicKey(publicKey)
        } catch (error) {
            console.error("Error generating address:", error)
            toast({
                title: "Error",
                description: "Failed to generate Bitcoin address. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Create drop link
    const createDropLink = async () => {
        if (!isLoggedIn) {
            toast({
                title: "Not signed in",
                description: "Please sign in to your NEAR wallet first.",
                variant: "destructive",
            })
            return
        }

        const satsAmount = Number.parseInt(amount)
        if (isNaN(satsAmount) || satsAmount < MIN_SATS) {
            toast({
                title: "Invalid amount",
                description: `Amount must be at least ${MIN_SATS} satoshis.`,
                variant: "destructive",
            })
            return
        }

        if (!recipientAddress || !recipientPublicKey) {
            toast({
                title: "Invalid recipient",
                description: "Failed to generate a Bitcoin address. Please try again.",
                variant: "destructive",
            })
            return
        }

        try {
            // Generate a new key pair for this drop
            const keyPair = nearAPI.KeyPair.fromRandom("ed25519")
            const publicKey = keyPair.getPublicKey().toString()

            if (web3auth?.connected && nearConnection && web3authAccountId) {
                // Call the smart contract to create the drop
                const account: nearAPI.Account = await nearConnection.account(web3authAccountId);
                const dropId = Date.now().toString() // Use a timestamp as a simple unique ID

                await account.functionCall({
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
                })

                // Add the drop key to the contract
                await account.functionCall({
                    contractId: "linkdrop.testnet", // Replace with your actual contract ID
                    methodName: "add_drop_key",
                    args: {
                        drop_id: dropId,
                        key: publicKey,
                    },
                    gas: BigInt("300000000000000"), // Adjust the gas as needed
                })

                const dropLink = `${window.location.origin}/claim/${dropId}#${keyPair?.toString()}`
                setDropLink(dropLink)

                toast({
                    title: "Drop link created",
                    description: "Your Bitcoin LinkDrop has been created successfully!",
                })
            }


            // Generate the drop link
        } catch (error) {
            console.error("Error creating drop link:", error)
            toast({
                title: "Error",
                description: "Failed to create drop link. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Create Bitcoin LinkDrop</CardTitle>
                <CardDescription>Send Bitcoin using NEAR</CardDescription>
            </CardHeader>
            <CardContent>
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
                        <Label htmlFor="recipient">Bitcoin Address</Label>
                        <Input id="recipient" value={recipientAddress} readOnly className="font-mono text-sm" />
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
            </CardContent>
        </Card>
    )
}

