"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { convertMinutesToHours } from "@/lib/utils";
import ActivityLengthCell from "./activity-length-cell";
import { useSchedule } from "./schedule-context";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";

interface ScheduleTableProps {
  activities: Doc<"activities">[];
}

export default function ScheduleTable() {
  const { state, dispatch } = useSchedule();

  const handleUpdateActivity = (
    activityId: Id<"activities">,
    updates: Partial<Activity>,
  ) => {
    dispatch({
      type: "UPDATE_ACTIVITY",
      payload: { _id: activityId, ...updates },
    });
  };

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
        {state.activities.map((activity) => (
          <TableRow key={activity._id}>
            <TableCell>
              <Checkbox></Checkbox>
            </TableCell>
            <TableCell>
              <Checkbox></Checkbox>
            </TableCell>
            <TableCell>{convertMinutesToHours(activity.start)}</TableCell>
            <TableCell>
              <Input
                value={activity.name}
                onChange={(e) =>
                  handleUpdateActivity(activity._id, { name: e.target.value })
                }
              />
            </TableCell>
            {/* <ActivityLengthCell activity={activity._id} /> */}
            <TableCell>
              <Input
                value={activity.length}
                onChange={(e) =>
                  handleUpdateActivity(activity._id, {
                    length: parseInt(e.target.value),
                  })
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
