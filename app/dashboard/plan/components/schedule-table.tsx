import { useQuery } from "convex/react";

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

import ActivityLengthCell from "./activity-length-cell";
import ActivityName from "./activity-name";
import AddActivityDrawerDialog from "./add-activity-drawer-dialog";

export default function ScheduleTable({ scheduleId }: { scheduleId: string }) {
  const activities = useQuery(api.activities.byScheduleOrder, { scheduleId: scheduleId as Id<"schedules"> });

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
          {activities.length > 0 ? activities.map((activity) => (
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
              <ActivityLengthCell activity={activity} />
              <TableCell className="w-20">{activity.actLen}</TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                <h2>This schedule doesn&apos;t have any activities yet.  Add some to begin.</h2>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="fixed bottom-[118px] right-4">
        <AddActivityDrawerDialog scheduleId={scheduleId as Id<"schedules">} />
      </div>
    </div>
  );
}
