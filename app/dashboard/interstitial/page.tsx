"use client";

import { useQuery } from "convex/react";

import SessionsList from "./components/sessions-list";
import Timer from "./components/timer/timer";

import { Toaster } from "@/components/ui/toaster";
import { api } from "@/convex/_generated/api";


export default function InterstitialPage() {
  const sessions = useQuery(api.sessions.todaySessions);

  return (
    <div className="h-full p-8 md:flex space-x-4">
      <div className="flex flex-col mx-auto space-y-4">
        <Timer />
      </div>
      {/* <SessionsList sessions={sessions ?? []} /> */}
      <Toaster />
    </div>
  );
}
