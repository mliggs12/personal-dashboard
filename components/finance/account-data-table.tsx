import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import { Transaction } from "@/lib/csv";

interface AccountDataTableProps {
  data: Transaction[];
}

export default async function AccountDataTable({
  data,
}: AccountDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Check Number</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction, index) => (
          <TableRow key={index}>
            <TableCell>{transaction.date}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell>{transaction.checkNumber}</TableCell>
            <TableCell>{transaction.amount}</TableCell>
            <TableCell>{transaction.balance}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
