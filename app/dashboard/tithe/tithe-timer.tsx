"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAudio } from "../interstitial/hooks/use-audio";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Clock from "../interstitial/components/timer/clock";
import CreateEmotionInput from "./create-emotion-input";
import { Id } from "@/convex/_generated/dataModel";

export default function TitheTimer() {
  const [open, setOpen] = useState(false);
  const [selectedEmotionId, setSelectedEmotionId] = useState<string | null>(
    null,
  );
  const [time, setTime] = useState<number | null>(null);
  const [initialDuration, setInitialDuration] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);

  const createSession = useMutation(api.sessions.create);
  const { play: playAlarmSound } = useAudio("/sound/airplane_chime.mp3");

  const emotions = useQuery(api.emotions.list);
  if (!emotions) return <p>Loading...</p>;
  if (emotions.length === 0) return <CreateEmotionInput />;

  function handleDurationSet(duration: number) {
    setInitialDuration(duration);
    setTime(duration);
  }

  function regressive(counter: number) {
    setTimeout(() => {
      if (counter > 0) {
        setTime(counter - 1);
        return regressive(counter - 1);
      } else {
        playAlarmSound();
        createSession({
          duration: initialDuration,
          emotionId: selectedEmotionId as Id<"emotions">,
        });

        setTime(null);
        setInitialDuration(0);
        setIsRunning(false);
      }
    }, 1000);
  }

  return (
    <Card className="w-[500px]">
      <CardContent className="space-y-4 pt-6">
        {!time ? (
          <>
            <Popover
              open={open}
              onOpenChange={setOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  {selectedEmotionId
                    ? emotions.find(
                        (emotion) => emotion._id === selectedEmotionId,
                      )?.label
                    : "Select emotion..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search emotions..." />
                  <CommandList>
                    <CommandEmpty>No emotion found.</CommandEmpty>
                    <CommandGroup>
                      {emotions === undefined ? (
                        <div>Loading...</div>
                      ) : (
                        emotions.map((emotion) => (
                          <CommandItem
                            key={emotion._id}
                            value={emotion._id}
                            onSelect={(currentValue) => {
                              setSelectedEmotionId(
                                currentValue === selectedEmotionId
                                  ? null
                                  : currentValue,
                              );
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedEmotionId === emotion._id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {emotion.label}
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[15, 30, 60, 120].map((duration) => (
                <Button
                  disabled={!selectedEmotionId}
                  variant="outline"
                  key={duration}
                  onClick={() => handleDurationSet(duration)}
                  className="py-8 shadow-md border-white/50 shadow-white/50 hover:shadow-white/40 hover:shadow-lg 
       transition-shadow duration-175"
                >
                  {duration} sec
                </Button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-10">
            <h3 className="text-5xl font-semibold">
              {
                emotions.find((emotion) => emotion._id === selectedEmotionId)
                  ?.label
              }
            </h3>
            <Clock seconds={time} />
            <Button onClick={() => regressive(time)}>
              {isRunning ? "Stop" : "Start"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
