import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Doc } from "@/convex/_generated/dataModel";

interface ScheduleTableProps {
  activities: Doc<"activities">[];
}

export default function ScheduleTable({ activities }: ScheduleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">F</TableHead>
          <TableHead className="w-10">R</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>Activity</TableHead>
          <TableHead>Length</TableHead>
          {/* <TableHead className="hidden sm:table-cell">Type</TableHead> */}
          {/* <TableHead className="text-right">Amount</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity._id}>
            <TableCell>
              <Checkbox></Checkbox>
            </TableCell>
            <TableCell>
              <Checkbox></Checkbox>
            </TableCell>
            <TableCell>{activity.start}</TableCell>
            <TableCell>{activity.name}</TableCell>
            <TableCell>{activity.length}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
