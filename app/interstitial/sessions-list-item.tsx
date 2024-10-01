import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";
import { formatTimePeriod, formatDurationVerbose } from "@/lib/utils";

export default function SessionsListItem({
  session,
  project,
}: {
  session: Doc<"sessions">;
  project: Doc<"projects">;
}) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>
          <div className="flex gap-2">
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: project?.color,
                borderRadius: "50%",
              }}
            />

            <h2>{project?.name}</h2>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{formatTimePeriod(session._creationTime, session.duration!)}</p>
        <p>{formatDurationVerbose(session.duration!)}</p>
        {session.pauseDuration && session.pauseDuration > 0 ? (
          <p>{formatDurationVerbose(session.pauseDuration!)} pause</p>
        ) : null}
        {session.notes && <p>{session.notes}</p>}
      </CardContent>
    </Card>
  );
}
