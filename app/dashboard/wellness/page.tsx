"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { api } from "@/convex/_generated/api";
import { getUserTimezone } from "@/lib/timezone.utils";

import { DatePicker } from "./components/date-picker";
import WaterDailyProgressChart from "./components/water-daily-progress-chart";
import WaterLogForm from "./components/water-log-form";

export default function WellnessPage() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date())

  const dayData = useQuery(api.waterLogEntries.dailyEntries, {
    timestamp: dayjs(date).toISOString(),
    userTimezone: getUserTimezone()
  });

  if (dayData === undefined)
    return <div>Loading...</div>;

  return (
    <div className="px-2 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Wellness Page</h1>
        <DatePicker date={date} onSelect={(e) => setDate(e)} />
      </div>

      <WaterDailyProgressChart date={date} currentOunces={dayData.dayTotalConsumed} />
      <div>
        <h2 className="text-xl">Entry Log</h2>
        <div>
          {dayData.entries &&
            dayData.entries.map((entry) => (
              <div
                key={entry._id}
                className="flex gap-2"
              >
                {dayjs(entry.timestamp).format("h:mm a")}
                <span>{entry.amount} oz</span>
              </div>
            ))}
        </div>
      </div>
      <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="fixed bottom-6 right-6 z-10"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle className="hidden" />
          <WaterLogForm onEntryCreated={() => setOpen(false)} />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
