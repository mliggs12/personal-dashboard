"use client";

import { useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";

import IntentionSelect from "./components/intention-select";
import { PomodoroTimer } from "./components/timer/pomodoro-timer";
import { TypeSelect } from "./components/type-select";

export default function Timer() {
  const [timerType, setTimerType] = useState<"session" | "tithe">("session");
  return (
    <Card className="h-[500px] max-w-[500px]">
      <CardHeader className="flex items-center">
        <CardTitle className="text-3xl">What&apos;s your focus?</CardTitle>
        <TypeSelect value={timerType} onValueChange={setTimerType} />
        <IntentionSelect />
      </CardHeader>
      <CardContent>
        <PomodoroTimer inputDuration={timerType === "session" ? 25 * 60 : 10} />
      </CardContent>
      <Toaster />
    </Card>
  );
}