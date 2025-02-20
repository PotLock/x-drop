"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { connect, keyStores, WalletConnection, KeyPair } from "near-api-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// NEAR testnet configuration
const config = {
  networkId: "testnet",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
}

export default function ClaimDrop() {
  const params = useParams()
  const [near, setNear] = useState<any>(null)
  const [wallet, setWallet] = useState<WalletConnection | null>(null)
  const [dropInfo, setDropInfo] = useState<any>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get the secret key from the URL hash
    const hash = window.location.hash.substring(1)
    if (hash) {
      setSecretKey(hash)
      // Remove the hash from the URL for security
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    initNear()
  }, [])

  // Initialize NEAR connection
  const initNear = async () => {
    try {
      const nearConnection = await connect(config)
      const walletConnection = new WalletConnection(nearConnection, "near-bitcoin-linkdrop")
      setNear(nearConnection)
      setWallet(walletConnection)

      if (walletConnection.isSignedIn()) {
        fetchDropInfo()
      }
    } catch (error) {
      console.error("Error initializing NEAR:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to NEAR network.",
        variant: "destructive",
      })
    }
  }

  // Fetch drop information
  const fetchDropInfo = async () => {
    if (!wallet || !params.dropId) return

    try {
      const account = wallet.account()
      const result = await account.viewFunction({
        contractId: "linkdrop.testnet", // Replace with your actual contract ID
        methodName: "get_drop",
        args: { drop_id: params.dropId },
      })
      setDropInfo(result)
    } catch (error) {
      console.error("Error fetching drop info:", error)
      toast({
        title: "Error",
        description: "Failed to fetch drop information.",
        variant: "destructive",
      })
    }
  }


  // Claim the drop
  const claimDrop = async () => {
    if (!wallet || !secretKey || !params.dropId) {
      toast({
        title: "Error",
        description: "Missing required information to claim drop.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const keyPair = KeyPair.fromString(secretKey as any)
      const account = wallet.account()

      // Claim the drop
      await account.functionCall({
        contractId: "linkdrop.testnet", // Replace with your actual contract ID
        methodName: "claim",
        args: {
          drop_id: params.dropId,
          public_key: keyPair.getPublicKey().toString(),
        },
        gas: BigInt("300000000000000"),
      })

      toast({
        title: "Success",
        description: "Drop claimed successfully! The Bitcoin will be sent to your address.",
      })

      // Clear the drop info to show claimed state
      setDropInfo(null)
    } catch (error) {
      console.error("Error claiming drop:", error)
      toast({
        title: "Error",
        description: "Failed to claim drop. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Claim Bitcoin LinkDrop</CardTitle>
          <CardDescription>Claim your Bitcoin sent via NEAR</CardDescription>
        </CardHeader>
        <CardContent>
        <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm">Connected: </p>
              </div>
              {dropInfo ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-sm font-medium">Drop Amount</p>
                    <p className="text-2xl font-bold">{dropInfo.amount} satoshis</p>
                  </div>

                  <Button onClick={claimDrop} className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Claiming..." : "Claim Drop"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Processing claim..." : "This drop has been claimed or does not exist."}
                  </p>
                </div>
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}

