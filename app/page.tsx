"use client"

import { useState } from "react"
import { PlusCircle, MinusCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TransactionForm from "./transaction-form"
import TransactionHistory from "./transaction-history"

type Transaction = {
  txId: string
  amount: number
  chain: string
  type: "deposit" | "withdrawal"
}

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const handleTransaction = (type: "deposit" | "withdrawal", amount: number, chain: string) => {
    const newTransaction: Transaction = {
      txId: Math.random().toString(36).substr(2, 9),
      amount,
      chain,
      type,
    }
    setTransactions([newTransaction, ...transactions])
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
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
                  onSubmit={(amount, chain) => handleTransaction("deposit", amount, chain)}
                  icon={<PlusCircle className="h-4 w-4" />}
                />
              </TabsContent>
              <TabsContent value="withdrawal">
                <TransactionForm
                  onSubmit={(amount, chain) => handleTransaction("withdrawal", amount, chain)}
                  icon={<MinusCircle className="h-4 w-4" />}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card>
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

