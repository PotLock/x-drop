"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  address: z.string().min(1, "Address is required"),
})

type BalanceData = {
  address: string
  balance: number
  chain: string
}

const exampleBalances: BalanceData[] = [
  { address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", balance: 5.2341, chain: "Ethereum" },
  { address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", balance: 0.3945, chain: "Bitcoin" },
  { address: "9hDC6zQpnHYXGfFxLJDHMVwKVTjbfoRVYDGcZGhYF1WB", balance: 145.7823, chain: "Solana" },
]

const getBalance = async (address: string): Promise<BalanceData> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const existingBalance = exampleBalances.find((b) => b.address === address)
  if (existingBalance) {
    return existingBalance
  }
  return {
    address,
    balance: Math.random() * 10,
    chain: "Unknown",
  }
}

export default function BalanceOfAddress() {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = await getBalance(values.address)
      setBalanceData(data)
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Balance of Address</CardTitle>
        <CardDescription>Check the balance of any blockchain address</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blockchain Address</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <Input {...field} placeholder="Enter address" />
                      <Button type="submit">
                        <Search className="h-4 w-4 mr-2" />
                        Check
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {balanceData && (
          <div className="mt-4 p-4 bg-secondary rounded-md">
            <h3 className="font-semibold text-lg mb-2">Balance Information</h3>
            <p>
              <span className="font-medium">Address:</span> {balanceData.address}
            </p>
            <p>
              <span className="font-medium">Balance:</span> {balanceData.balance.toFixed(4)} {balanceData.chain}
            </p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Example Balances</h3>
          <ScrollArea className="h-[200px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Address</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Chain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exampleBalances.map((balance) => (
                  <TableRow key={balance.address}>
                    <TableCell className="font-mono text-xs">{balance.address}</TableCell>
                    <TableCell>{balance.balance.toFixed(4)}</TableCell>
                    <TableCell>{balance.chain}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

