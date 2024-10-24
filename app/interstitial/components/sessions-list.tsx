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
    <div className="w-full space-y-2">
      <p className="text-xl flex flex-col gap-2 border-2 p-4">
        Today&apos;s Focus Time:
        <span className="font-bold text-center text-3xl">
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
