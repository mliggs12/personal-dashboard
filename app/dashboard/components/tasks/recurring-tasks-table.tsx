"use client";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Doc } from "@/convex/_generated/dataModel";
import { RecurringTask } from "@/types";

dayjs.extend(localizedFormat);

export default function RecurringTasksTable(
  recurringTasks: Doc<"recurringTasks">[],
) {
  return (
    <Table>
      <TableHeader className="bg-secondary">
        <TableRow>
          <TableHead className="px-2 text-secondary-foreground">Name</TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Status
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Created
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Updated
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Frequency
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recurringTasks.map((r: RecurringTask, index) => {
          return (
            <TableRow key={index}>
              <TableCell className="max-w-[250px] pl-2 pr-10">
                <div className="flex items-center gap-3">
                  <h1 className="text-base truncate font-semibold">{r.name}</h1>
                </div>
              </TableCell>
              <TableCell className="pl-2 pr-10 capitalize">
                {r.status}
              </TableCell>
              <TableCell className="pl-2 pr-10">
                {dayjs(r._creationTime).format("L")}
              </TableCell>
              <TableCell className="pl-2 pr-10 text-nowrap">
                {dayjs(r.updated).format("l LT")}
              </TableCell>
              <TableCell className="pl-2 pr-10 capitalize">
                {r.frequency}
              </TableCell>
              <TableCell className="pl-2 pr-10 capitalize">{r.type}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
