import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

type Transaction = {
  txId: string
  amount: number
  chain: string
  type: "deposit" | "withdrawal"
  twitterAccount: string
}

export default function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  return (
    <ScrollArea className="h-[300px] w-full rounded-md border">
      <Table>
        <TableCaption>A list of your recent transactions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Tx ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Chain</TableHead>
            <TableHead className="w-[150px]">Twitter Account</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.txId}>
              <TableCell className="font-medium">{tx.txId}</TableCell>
              <TableCell className="capitalize">{tx.type}</TableCell>
              <TableCell>{tx.amount}</TableCell>
              <TableCell className="capitalize">{tx.chain}</TableCell>
              <TableCell>{tx.twitterAccount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

