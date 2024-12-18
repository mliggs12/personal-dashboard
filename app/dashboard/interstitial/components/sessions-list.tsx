"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { formatDurationVerbose } from "@/lib/utils";
import SessionItem from "./session-item";

export default function SessionList({
  sessions,
}: {
  sessions: Doc<"sessions">[];
}) {
  const totalDuration =
    sessions?.reduce((acc, session) => acc + (session?.duration ?? 0), 0) ?? 0;

  return (
    <div className="space-y-2 w-full">
      <p className="text-lg flex flex-col gap-2 border-2 p-4">
        Today&apos;s Focus Time:
        <span className="text-center text-2xl">
          {formatDurationVerbose(totalDuration)}
        </span>
      </p>
      {sessions?.map((session, index) => {
        return (
          <SessionItem
            key={index}
            session={session}
          />
        );
      })}
    </div>
  );
}
