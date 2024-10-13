"use client";

import Link from "next/link";
import { formatTimestamp } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BeliefsCard from "./components/beliefs-card";
import NotesWidget from "./components/notes-widget";

export default function DashboardPage() {
  const statements = useQuery(api.statements.todayMindDumpStatements);
  const beliefs = useQuery(api.beliefs.activeBeliefsToday);

  if (statements === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container p-0 md:py-8 md:px-4">
      <div className="flex flex-col">
        <div className="flex-1 p-4 p md:p-8 md:pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl md:text-7xl font-bold tracking-tight">
              Dashboard
            </h2>
            <div className="hidden md:flex items-center justify-center">
              <p className="text-lg">{formatTimestamp(Date.now())}</p>
            </div>
          </div>
          <div className="border-y-2 p-2 md:p-4 space-y-2 my-2 md:my-12">
            <h3 className="text-xl md:text-3xl font-semibold">
              Intention for my life
            </h3>
            <p className="text-lg md:text-2xl font-light italic">
              Alignment with True self
              <br />
              To live with a consistent, unconditional feeling of a fullness of
              being with an inner satisfaction and a passion for life and for
              living.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="hidden md:flex ml-auto gap-1 mb-4"
          >
            <Link href="/me5">
              Mind Dump
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <BeliefsCard />
          <NotesWidget />
        </div>
      </div>
    </div>
  );
}
