"use client";

import { useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

import { formatDuration, formatLargeNumber } from "../lib/format";

export function MatchesTable() {
  const matches = useQuery(api.gdMatches.list, { limit: 100 });
  const removeMatch = useMutation(api.gdMatches.remove);
  const { toast } = useToast();

  const handleDelete = async (matchId: Id<"gdMatches">) => {
    if (!confirm("Delete this match?")) return;
    try {
      await removeMatch({ matchId });
      toast({ title: "Match deleted", duration: 2000 });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete match",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent matches</CardTitle>
        <CardDescription>
          Newest first — click a row to see turret detail
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {matches === undefined ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : matches.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            No matches yet.{" "}
            <Link
              href="/dashboard/gd/matches/import"
              className="underline"
            >
              Upload a screenshot
            </Link>{" "}
            to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>HP</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Cubes</TableHead>
                <TableHead>Top turret</TableHead>
                <TableHead>Total DMG</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m) => {
                const top = [...m.turrets].sort(
                  (a, b) => b.damage - a.damage,
                )[0];
                const total = m.turrets.reduce(
                  (s, t) => s + t.damage,
                  0,
                );
                return (
                  <TableRow key={m._id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(m.playedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.result === "victory"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {m.result === "victory" ? "Victory" : "Defeat"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.stageNumber}
                      {m.stageDifficulty === "elite" && (
                        <span className="ml-1 text-xs text-amber-500">
                          elite
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {m.remainingHpPct != null
                        ? `${m.remainingHpPct}%`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {formatDuration(m.durationSeconds)}
                    </TableCell>
                    <TableCell>{m.rewardCubes ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {top?.turretDisplayName ?? top?.turretKey ?? "—"}
                    </TableCell>
                    <TableCell>{formatLargeNumber(total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(m._id)}
                        aria-label="Delete match"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
