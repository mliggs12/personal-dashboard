"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { useState } from "react";
import WaterLogForm from "./components/water-log-form";

export default function WellnessPage() {
  const [open, setOpen] = useState(false);

  const dailyEntries = useQuery(api.waterLogEntries.dailyEntries);
  const dailyTotal = useQuery(api.waterLogEntries.dailyTotal);

  if (dailyEntries === undefined) return <div>Loading...</div>;

  return (
    <div className="px-2 space-y-4">
      <h1>Wellness Page</h1>
      <div>
        <h2>Daily Water Log</h2>
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
      <div>Daily Total: {dailyTotal} oz</div>
      <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 m-4 z-0"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <WaterLogForm className="" />
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
