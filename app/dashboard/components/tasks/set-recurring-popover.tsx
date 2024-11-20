import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function SetRecurringPopover() {
  const [value, setValue] = useState("daily");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">Set recurring</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Select
          value={value}
          onValueChange={setValue}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
}
