import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LayoutTable() {
  return (
    <Table className="border-y">
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">F</TableHead>
          <TableHead className="w-10">R</TableHead>
          <TableHead className="w-16">Start</TableHead>
          <TableHead>Activity</TableHead>
          <TableHead className="w-14">Len</TableHead>
          <TableHead className="w-20">ActLen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="w-10"><Checkbox /></TableCell>
          <TableCell className="w-10"><Checkbox /></TableCell>
          <TableCell className="w-16">{"-"}</TableCell>
          <TableCell>{"-"}</TableCell>
          <TableCell className="w-14">{"-"}</TableCell>
          <TableCell className="w-20">{"-"}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
