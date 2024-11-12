import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Doc } from "@/convex/_generated/dataModel";
import { formatMinToReadable } from "@/lib/utils";

export default function ScheduleActivitiesTable({
  activities,
}: {
  activities: Doc<"activities">[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1">F</TableHead>
          <TableHead className="w-1">R</TableHead>
          <TableHead className="w-6">Start</TableHead>
          <TableHead className="w-96">Activity</TableHead>
          <TableHead className="w-6">Length</TableHead>
          <TableHead className="w-6">ActLen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity._id}>
            <TableCell className="w-1">
              <Checkbox checked={activity.isForced} />
            </TableCell>
            <TableCell className="w-1">
              <Checkbox checked={activity.isRigid} />
            </TableCell>
            <TableCell className="w-6">
              {formatMinToReadable(activity.start)}
            </TableCell>
            <TableCell className="w-96">{activity.name}</TableCell>
            <TableCell className="w-6">{activity.length}</TableCell>
            <TableCell className="w-6">{"-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
