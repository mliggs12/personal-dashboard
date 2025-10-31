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

dayjs.extend(localizedFormat);

interface TaskStats {
  count: number;
  lastRecurrence: number | undefined;
}

interface RecurringTaskWithStats extends Doc<"recurringTasks"> {
  stats: TaskStats;
}

interface RecurringTasksTableProps {
  recurringTasks: RecurringTaskWithStats[];
}

export default function RecurringTasksTable({
  recurringTasks,
}: RecurringTasksTableProps) {
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
          <TableHead className="hidden px-2 text-secondary-foreground">
            Updated
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Frequency
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">Type</TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Count
          </TableHead>
          <TableHead className="px-2 text-secondary-foreground">
            Last Recurrence
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recurringTasks.map((task) => (
          <TableRow key={task._id}>
            <TableCell className="max-w-[250px] pl-2 pr-10">
              <div className="flex items-center gap-3">
                <h1 className="text-base truncate font-semibold">
                  {task.name}
                </h1>
              </div>
            </TableCell>
            <TableCell className="pl-2 pr-10 capitalize">
              {task.status}
            </TableCell>
            <TableCell className="pl-2 pr-10">
              {dayjs(task._creationTime).format("L")}
            </TableCell>
            <TableCell className="hidden pl-2 pr-10 text-nowrap">
              {dayjs(task.updated).format("l LT")}
            </TableCell>
            <TableCell className="pl-2 pr-10 capitalize">
              {task.frequency}
            </TableCell>
            <TableCell className="pl-2 pr-10 capitalize">{task.type}</TableCell>
            <TableCell className="pl-2 pr-10 capitalize">
              {task.stats.count}
            </TableCell>
            <TableCell className="pl-2 pr-10 capitalize">
              {task.stats.lastRecurrence
                ? dayjs(task.stats.lastRecurrence).format("l LT")
                : "Never"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
