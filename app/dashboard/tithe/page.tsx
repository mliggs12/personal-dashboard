"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import TitheTimer from "./tithe-timer";
// import TotalsBarChart from "./totals-bar-chart";
import SessionList from "../interstitial/components/sessions-list";

export default function TitheTrackerPage() {
  const titheSessions = useQuery(api.sessions.titheSessions);

  return (
    <div className="flex flex-col p-2 h-full gap-2">
      <h1 className="text-4xl font-semibold">Tithe Tracker</h1>
      <div className="flex flex-col flex-1 space-y-4">
        <TitheTimer />
        {titheSessions === undefined ? (
          <p>Loading Tithe Sessions...</p>
        ) : (
          <SessionList sessions={titheSessions} />
        )}
        {/* <TotalsBarChart /> */}
      </div>
    </div>
  );
}
