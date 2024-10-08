import SessionsListItem from "./sessions-list-item";
import { Doc } from "@/convex/_generated/dataModel";

export default function SessionList({
  sessions,
  projects,
}: {
  sessions: Doc<"sessions">[];
  projects: Doc<"projects">[];
}) {
  return (
    <div className="w-full">
      {sessions?.map((session, index) => {
        const project = projects?.find((p) => p._id === session.projectId);

        return (
          <SessionsListItem
            key={index}
            session={session}
            project={project!}
          />
        );
      })}
    </div>
  );
}
