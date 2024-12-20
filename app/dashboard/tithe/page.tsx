"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import TitheTimer from "./tithe-timer";
// import TotalsBarChart from "./totals-bar-chart";
import SessionList from "../interstitial/components/sessions-list";

export default function TitheTrackerPage() {
  const todayTitheSessions = useQuery(api.sessions.todayTitheSessions);

  return (
    <div className="flex flex-col p-2 h-full gap-2">
      <h1 className="text-4xl font-semibold">Tithe Tracker</h1>
      <div className="flex flex-col flex-1 space-y-4">
        <TitheTimer />
        {todayTitheSessions === undefined ? (
          <p>Loading Tithe Sessions...</p>
        ) : (
          <SessionList sessions={todayTitheSessions} />
        )}
        {/* <TotalsBarChart /> */}
      </div>
    </div>
  );
}
