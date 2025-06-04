"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

import { useAudio } from "@/app/dashboard/interstitial/hooks/use-audio";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import IntentionSelect from "./components/intention-select";
import SessionsList from "./components/sessions-list";
import { PomodoroTimer } from "./components/timer/pomodoro-timer";

export default function InterstitialPage() {


  return (
    <div className="h-full p-8 md:flex space-x-4">
      <div className="flex flex-col mx-auto space-y-4">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="text-center text-3xl">What&apos;s your focus?</CardTitle>
            <IntentionSelect />
          </CardHeader>
          <CardContent>
            <PomodoroTimer />
          </CardContent>
        </Card>
      </div>
      {/* <SessionsList sessions={sessions ?? []} /> */}
      <Toaster />
    </div>
  );
}
