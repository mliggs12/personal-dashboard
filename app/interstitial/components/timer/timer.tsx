import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Clock from "./clock";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAudio } from "@/app/interstitial/hooks/use-audio";
import SetIntentionButton from "../set-intention-button";
import { Id } from "@/convex/_generated/dataModel";

export default function Timer() {
  const [time, setTime] = useState<number | null>(null);
  const [intentionId, setIntentionId] = useState<Id<"intentions"> | null>(null);
  const [intentionTitle, setIntentionTitle] = useState<string | null>(null);
  const [intentionWhy, setIntentionWhy] = useState<string | null>(null);

  const createSession = useMutation(api.sessions.create);

  const { play: playAlarmSound } = useAudio("/sound/airplane_chime.mp3");

  function regressive(counter: number = 0) {
    setTimeout(() => {
      if (counter > 0) {
        setTime(counter - 1);
        return regressive(counter - 1);
      } else {
        playAlarmSound();
        createSession({
          duration: time ?? undefined,
          intentionId: intentionId ?? undefined,
        });
        setTime(null);
        setIntentionId(null);
        setIntentionTitle(null);
        setIntentionWhy(null);
      }
    }, 1000);
  }

  const handleIntentionSet = (
    id: Id<"intentions">,
    title: string,
    why: string,
    time: number,
  ) => {
    setIntentionId(id);
    setIntentionTitle(title);
    setIntentionWhy(why);
    setTime(time);
  };

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Timer</CardTitle>
        <CardDescription>Enter a duration and start the timer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <SetIntentionButton onIntentionSet={handleIntentionSet} />
        </div>
        {intentionTitle && intentionWhy && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{intentionTitle}</h3>
            <p className="">{intentionWhy}</p>
          </div>
        )}
        <div className="flex flex-col items-center text-9xl space-y-10 mt-8">
          <Clock time={time} />
          <Button onClick={() => regressive(time ?? undefined)}>Start</Button>
        </div>
      </CardContent>
    </Card>
  );
}
