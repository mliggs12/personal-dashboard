import { useQuery } from "convex/react";
import moment from "moment-timezone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { formatDurationVerbose } from "@/lib/utils";

export default function SessionItem({
  session,
  intentionId,
}: {
  session: Doc<"sessions">;
  intentionId: Id<"intentions">;
}) {
  const intention = useQuery(api.intentions.get, {
    intentionId: intentionId as Id<"intentions">,
  });

  // Calculate start and end times
  const endTime = moment(session._creationTime);
  const startTime = moment(endTime).subtract(session.duration!, "seconds");
  const formattedTimeRange = `${startTime.format("h:mm:ss a")} - ${endTime.format("h:mm:ss a")}`;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>
          <div className="">
            <h2>{intention?.title}</h2>
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
