import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doc, Id } from "@/convex/_generated/dataModel";
import dayjs from "dayjs";
import { formatDurationVerbose } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function SessionItem({ session }: { session: Doc<"sessions"> }) {
  // Calculate start and end times
  const endTime = dayjs(session._creationTime);
  const startTime = dayjs(endTime).subtract(session.duration!, "seconds");
  const formattedTimeRange = `${startTime.format("h:mm:ss a")} - ${endTime.format("h:mm:ss a")}`;

  const emotionLabel = useQuery(api.emotions.labelById, {
    emotionId: session.emotionId as Id<"emotions">,
  });

  return (
    <Card className="w-full flex flex-col gap-1">
      <CardHeader className="p-2 pb-0 pl-6">
        <CardTitle className="font-normal text-lg">
          <div>
            <h2>{session.what}</h2>
            <h2>{session.why}</h2>
            <h2>{emotionLabel}</h2>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm p-2 pt-0 pl-6">
        <p>{formatDurationVerbose(session.duration!)}</p>
        <p>{formattedTimeRange}</p>
        {session.notes && <p>{session.notes}</p>}
      </CardContent>
    </Card>
  );
}
