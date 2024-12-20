"use client";

import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

dayjs.extend(localizedFormat);

export default function SleepTracker() {
  const activeSession = useQuery(api.sleepRecords.getActiveSleepSession);

  const recordStart = useMutation(api.sleepRecords.recordSleepStart);
  const recordEnd = useMutation(api.sleepRecords.recordSleepEnd);

  useEffect(() => {
    if (activeSession) {
      setCurrentRecordId(activeSession._id);
    }
  }, [activeSession]);

  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  const handleSleepStart = async () => {
    const recordId = await recordStart({ timestamp: Date.now() });
    setCurrentRecordId(recordId);
  };

  const handleSleepEnd = async () => {
    if (currentRecordId) {
      await recordEnd({
        recordId: currentRecordId as Id<"sleepRecords">,
        timestamp: Date.now(),
      });
      setCurrentRecordId(null);
    }
  };

  if (activeSession === undefined) {
    return <div>Loading...</div>;
  }

  if (activeSession === null) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <Button
          onClick={handleSleepStart}
          size="lg"
          variant="outline"
        >
          Start Sleep
        </Button>
      </div>
    );
  }

  if (activeSession) {
    return (
      <div className="flex flex-col flex-1 gap-8 text-center items-center justify-center">
        <h2 className="text-3xl">Sleep started at:</h2>
        <p className="text-7xl">
          {dayjs(activeSession.sleepStart).format("LT")}
        </p>
        <Button
          onClick={handleSleepEnd}
          size="lg"
          variant="secondary"
        >
          End Sleep
        </Button>
      </div>
    );
  }
}
