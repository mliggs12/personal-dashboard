"use client";

import { Upload } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { KpiCards } from "./components/kpi-cards";
import { MatchesTable } from "./components/matches-table";
import { StageProgressChart } from "./components/stage-progress-chart";
import { TurretLeaderboard } from "./components/turret-leaderboard";

export default function GDMatchesPage() {
  return (
    <div className="flex h-full flex-col space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-2xl font-semibold">
            Galaxy Defense Matches
          </h2>
          <p className="text-sm text-muted-foreground">
            Auto-parsed end-game stats from your screenshots
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/gd">Back to stages</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/gd/matches/import">
              <Upload className="h-4 w-4 mr-2" />
              Upload screenshots
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <KpiCards />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StageProgressChart />
          <TurretLeaderboard />
        </div>
        <MatchesTable />
      </div>
    </div>
  );
}
