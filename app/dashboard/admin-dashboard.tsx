"use client"

import { useState } from "react"
import { PlusCircle, MinusCircle, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import TransactionForm from "./transaction-form"
import TransactionHistory from "./transaction-history"

type Transaction = {
  txId: string
  amount: number
  chain: string
  type: "deposit" | "withdrawal"
  twitterAccount: string
}

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      txId: "abc123",
      amount: 1.5,
      chain: "ethereum",
      type: "deposit",
      twitterAccount: "@alice_eth",
    },
    {
      txId: "def456",
      amount: 0.5,
      chain: "bitcoin",
      type: "withdrawal",
      twitterAccount: "@bob_btc",
    },
    {
      txId: "ghi789",
      amount: 10,
      chain: "solana",
      type: "deposit",
      twitterAccount: "@charlie_sol",
    },
  ])
  const { data: session } = useSession()
  const router = useRouter()

  const handleTransaction = (type: "deposit" | "withdrawal", amount: number, chain: string, twitterAccount: string) => {
    const newTransaction: Transaction = {
      txId: Math.random().toString(36).substr(2, 9),
      amount,
      chain,
      type,
      twitterAccount,
    }
    setTransactions([newTransaction, ...transactions])
    console.log("New transaction added:", newTransaction) // Debug log
  }

  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Make a deposit or withdrawal</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deposit">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdrawal">Withdrawal</TabsTrigger>
              </TabsList>
              <TabsContent value="deposit">
                <TransactionForm
                  onSubmit={(amount, chain, twitterAccount) =>
                    handleTransaction("deposit", amount, chain, twitterAccount)
                  }
                  icon={<PlusCircle className="h-4 w-4" />}
                />
              </TabsContent>
              <TabsContent value="withdrawal">
                <TransactionForm
                  onSubmit={(amount, chain, twitterAccount) =>
                    handleTransaction("withdrawal", amount, chain, twitterAccount)
                  }
                  icon={<MinusCircle className="h-4 w-4" />}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

