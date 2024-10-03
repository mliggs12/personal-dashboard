"use client";

import Link from "next/link";
import { formatTimestamp } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BeliefsCard from "./components/beliefs-card";

export default function DashboardPage() {
  const statements = useQuery(api.statements.todayMindDumpStatements);
  const beliefs = useQuery(api.beliefs.activeBeliefsToday);

  if (statements === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container pt-8 pb-8 px-4 sm:px-8">
      <div className="hidden flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl 2xl:text-7xl font-bold tracking-tight">
              Dashboard
            </h2>
            <div className="flex items-center justify-center">
              <p className="text-lg">{formatTimestamp(Date.now())}</p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="ml-auto gap-1"
          >
            <Link href="/me5">
              Mind Dump
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <BeliefsCard />
        </div>
      </div>
    </div>
  );
}
