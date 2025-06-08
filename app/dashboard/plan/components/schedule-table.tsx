import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatMinToReadable } from "@/lib/utils";

import ActivityName from "./activity-name";

export default function ScheduleTable({ scheduleId }: { scheduleId: string }) {
  const activities = useQuery(api.activities.byScheduleOrder, { scheduleId: scheduleId as Id<"schedules"> });
  const addActivity = useMutation(api.activities.create);

  useEffect(() => {
    if (activities === undefined || activities.length > 0) return
    addActivity({
      scheduleId: scheduleId as Id<"schedules">,
    });
  }, [activities, addActivity, scheduleId]);

  if (activities === undefined) {
    return (
      <div>Loading activities...</div>
    );
  }

  return (
    <div>
      <Table className="border-y">
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell w-10 text-center">F</TableHead>
            <TableHead className="hidden md:table-cell w-10 text-center">R</TableHead>
            <TableHead className="w-16">Start</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead className="w-14">Length</TableHead>
            <TableHead className="w-20">ActLen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity._id}>
              <TableCell className="hidden md:table-cell w-10">
                <Checkbox checked={activity.isForced} />
              </TableCell>
              <TableCell className="hidden md:table-cell w-10">
                <Checkbox checked={activity.isRigid} />
              </TableCell>
              <TableCell className="w-16">{formatMinToReadable(activity.start)}</TableCell>
              <TableCell>
                <ActivityName activity={activity} />
              </TableCell>
              <TableCell className="w-14">{activity.length}</TableCell>
              <TableCell className="w-20">{"-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="absolute bottom-4 right-4">
        <Button
          onClick={() => addActivity({ scheduleId: scheduleId as Id<"schedules"> })}
        >
          Add activity
        </Button>
      </div>
    </div>
  );
}
