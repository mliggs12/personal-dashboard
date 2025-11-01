"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import IntentionSelect from "./components/intention-select";
import { CountdownTimer } from "./components/timer/countdown-timer";
import { TypeSelect } from "./components/type-select";

export default function Timer() {
  const [timerType, setTimerType] = useState<"session" | "tithe">("session");
  const [selectedIntention, setSelectedIntention] = useState<Doc<"intentions"> | null>(null);
  const [selectedIntentionId, setSelectedIntentionId] = useState<Id<"intentions"> | null>(null);

  const timerStore = useQuery(api.timers.getActiveTimer);
  const storedIntention = useQuery(
    api.intentions.get,
    timerStore?.intentionId ? { id: timerStore.intentionId } : "skip"
  );

  // Restore timer type and intention from store on load
  useEffect(() => {
    if (timerStore && timerStore.status !== "idle") {
      if (timerStore.timerType) {
        // eslint-disable-next-line
        setTimerType(timerStore.timerType);
      }
      if (timerStore.intentionId && storedIntention) {
        setSelectedIntention(storedIntention);
        setSelectedIntentionId(timerStore.intentionId);
      }
    }
  }, [timerStore, storedIntention]);

  const duration = timerType === "session" ? 25 * 60 : 5 * 60;

  return (
    <Card className="h-[570px] w-full max-w-[600px] flex flex-col">
      <CardHeader className="flex items-center h-full">
        {(!timerStore || timerStore.status === "idle") ? (
          <>
            <CardTitle className="text-3xl">What&apos;s your focus?</CardTitle>
            <TypeSelect value={timerType} onValueChange={setTimerType} />
            <IntentionSelect 
              onIntentionSelect={setSelectedIntention}
              onIntentionIdSelect={setSelectedIntentionId}
            />
          </>
        ) : (
          <div className="text-center">
            <CardTitle className="text-2xl font-light text-foreground mb-2 flex items-center justify-center gap-3">
              {selectedIntention?.title || "Focus Session"}
            </CardTitle>
            <p className="text-sm text-muted-foreground capitalize">
              {timerType} Mode
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <CountdownTimer 
          duration={duration} 
          timerType={timerType}
          selectedIntention={selectedIntention}
          selectedIntentionId={selectedIntentionId}
        />
      </CardContent>
      <Toaster />
    </Card>
  );
}