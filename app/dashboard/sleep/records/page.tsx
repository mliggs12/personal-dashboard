"use client";

import { useQuery } from "convex/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import {
  calculateDuration,
  timestampToShortDate,
  timestampToTime,
} from "@/lib/date.utils";

export default function SleepRecords() {
  const records = useQuery(api.sleepRecords.CompletedSleepRecords);

  if (records === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-2">
      <h1 className="text-lg font-semibold md:text-2xl">Sleep Record</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Sleep Start</TableHead>
            <TableHead>Sleep End</TableHead>
            <TableHead>Duration (hr.)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records?.map((record) => (
            <TableRow key={record._id}>
              <TableCell>{timestampToShortDate(record.sleepStart)}</TableCell>
              <TableCell>{timestampToTime(record.sleepStart)}</TableCell>
              <TableCell>{timestampToTime(record.sleepEnd!)}</TableCell>
              <TableCell>
                {calculateDuration(record.sleepEnd!, record.sleepStart)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
