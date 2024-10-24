import { useQuery } from "convex/react";
import moment from "moment-timezone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { formatDurationVerbose } from "@/lib/utils";

export default function SessionItem({ session }: { session: Doc<"sessions"> }) {
  // Calculate start and end times
  const endTime = moment(session._creationTime);
  const startTime = moment(endTime).subtract(session.duration!, "seconds");
  const formattedTimeRange = `${startTime.format("h:mm:ss a")} - ${endTime.format("h:mm:ss a")}`;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>
          <div>
            <h2>{session.what}</h2>
            <h2>{session.why}</h2>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{formatDurationVerbose(session.duration!)}</p>
        <p>{formattedTimeRange}</p>
        {session.notes && <p>{session.notes}</p>}
      </CardContent>
    </Card>
  );
}
