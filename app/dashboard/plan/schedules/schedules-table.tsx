"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { MoreHorizontal } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { deleteSchedule } from "./_actions";

interface SchedulesTableProps {
  preloadedSchedules: Preloaded<typeof api.schedules.list>;
}

async function handleDelete(scheduleId: Id<"schedules">) {
  await deleteSchedule(scheduleId);
}

export default function SchedulesTable({
  preloadedSchedules,
}: SchedulesTableProps) {
  const schedules = usePreloadedQuery(preloadedSchedules);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Length</TableHead>
          <TableHead>Template?</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => (
          <TableRow key={schedule._id}>
            <TableCell>{schedule.name}</TableCell>
            <TableCell>{schedule.date}</TableCell>
            <TableCell>{schedule.length}</TableCell>
            <TableCell>{schedule.isTemplate ? "Yes" : "No"}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-haspopup="true"
                    size="icon"
                    variant="ghost"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href={`/plan/schedules/${schedule._id}`}>Edit</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(schedule._id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
