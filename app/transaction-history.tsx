import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Transaction = {
  txId: string
  amount: number
  chain: string
  type: "deposit" | "withdrawal"
}

export default function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  return (
    <Table>
      <TableCaption>A list of your recent transactions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Chain</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.txId}>
            <TableCell>{tx.txId}</TableCell>
            <TableCell className="capitalize">{tx.type}</TableCell>
            <TableCell>{tx.amount}</TableCell>
            <TableCell className="capitalize">{tx.chain}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

