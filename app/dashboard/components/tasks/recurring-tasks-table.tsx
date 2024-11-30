"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export default function RecurringTasksTable({
  recurringTasks,
}: RecurringTasksTableProps) {
  return (
    <Table>
      <TableHeader className="bg-secondary">
        <TableRow>
          <TableHead className="px-2 text-secondary-foreground">Name</TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Created
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Updated
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Status
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Frequency
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Last recur
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Next due
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Recur count
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recurringTasks.map((r: RecurringTask) => {
          const created = dayjs(r.created).format("L");
          const updated = dayjs(r.updated).format("l LT");

          return (
            <TableRow key={r.id}>
              <TableCell className="max-w-[250px] pl-2 pr-10">
                <div className="flex items-center gap-3">
                  <h1 className="text-base truncate font-semibold">{r.name}</h1>
                </div>
              </TableCell>
              <TableCell className="pl-2 pr-10">{created}</TableCell>
              <TableCell className="pl-2 pr-10 text-nowrap">
                {updated}
              </TableCell>
              <TableCell className="pl-2 pr-10">{r.status}</TableCell>
              <TableCell className="pl-2 pr-10 capitalize">
                {r.frequency}
              </TableCell>
              <TableCell className="pl-2 pr-10">{updated}</TableCell>
              <TableCell className="pl-2 pr-10">
                {/* {NextDueDate(r.frequency)} */}
                {r.frequency}
              </TableCell>
              <TableCell className="pl-2 pr-10 text-center">
                {r.recurCount}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
