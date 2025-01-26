"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { api } from "@/convex/_generated/api";

import WaterDailyProgressChart from "./components/water-daily-progress-chart";
import WaterLogForm from "./components/water-log-form";

dayjs.extend(timezone);
dayjs.extend(utc);

export default function WellnessPage() {
  const [open, setOpen] = useState(false);

  const clientTimezone = dayjs.tz.guess();
  const dailyEntries = useQuery(api.waterLogEntries.dailyEntries, {
    tz: clientTimezone,
  });
  const dailyTotal = useQuery(api.waterLogEntries.dailyTotal, {
    tz: clientTimezone,
  });

  if (dailyEntries === undefined || dailyTotal === undefined)
    return <div>Loading...</div>;

  return (
    <div className="px-2 space-y-4">
      <h1 className="text-2xl">Wellness Page</h1>
      <WaterDailyProgressChart currentOunces={dailyTotal} />
      <div>
        <h2 className="text-xl">Entry Log</h2>
        <div>
          {dailyEntries &&
            dailyEntries.map((entry) => (
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
