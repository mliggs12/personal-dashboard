import { useMutation } from "convex/react";
import { useState } from "react";

import Clock from "./clock";
import IntentionSelect from "../intention-select";

import { useAudio } from "@/app/dashboard/interstitial/hooks/use-audio";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";


export default function Timer() {
  const [time, setTime] = useState<number>(1500); // Initialize with a default number
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [whatStatement, setWhatStatement] = useState<string | null>(null);
  const [whyStatement, setWhyStatement] = useState<string | null>(null);

  const createSession = useMutation(api.sessions.create);

  const { play: playAlarmSound } = useAudio("/sound/airplane_chime.mp3");

  function regressive(counter: number) {
    setTimeout(() => {
      if (counter > 0) {
        setTime(counter - 1);

        return regressive(counter - 1);
      } else {
        playAlarmSound();
        createSession({
          duration: time,
          what: whatStatement!,
          why: whyStatement ?? undefined,
        });
        setTime(1500); // Reset to a default number
        setWhatStatement(null);
        setWhyStatement(null);
      }
    }, 1000);
  }

  const handleIntentionSet = (what: string, why: string, time: number) => {
    setWhatStatement(what);
    setWhyStatement(why);
    setTime(time);
  };

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle className="text-center text-3xl">What&apos;s your focus?</CardTitle>
        <IntentionSelect />
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
        </div>
        {whatStatement && whyStatement && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{whatStatement}</h3>
            <p className="">{whyStatement}</p>
          </div>
        )}
        <div className="flex flex-col items-center text-9xl space-y-10 mt-8">
          <Clock seconds={time} />
          <Button onClick={() => regressive(time)}>
            {isRunning ? "Pause" : "Start"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
