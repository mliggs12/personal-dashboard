"use client";

import { Checkbox } from "@/components/ui/checkbox";

export default function WeekCheckbox({
  index,
  weeksAlive,
}: {
  index: number;
  weeksAlive: number;
}) {
  return (
    <Checkbox
      checked={index + 1 <= weeksAlive}
      onCheckedChange={() => console.log(`Clicked box ${index + 1}`)}
    />
  );
}
