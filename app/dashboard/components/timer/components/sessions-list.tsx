"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { formatShortDate } from "@/lib/date.utils";
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
        {formatShortDate(new Date())} - Today&apos;s Focus Time:
        <span className="text-center text-2xl">
          {formatDurationVerbose(totalDuration)}
        </span>
      </p>
      {sessions?.length ? (
        sessions.map((session, index) => (
          <SessionItem
            key={index}
            session={session}
          />
        ))
      ) : (
        <p className="text-center text-gray-500">No sessions recorded today</p>
      )}
    </div>
  );
}
