
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils";

interface TypeSelectProps {
  value: "session" | "tithe";
  onValueChange: (value: "session" | "tithe") => void;
};

export function TypeSelect({ value, onValueChange }: TypeSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[155px] h-9 rounded-3xl">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={"session"}>
          <TypeItem type={"session"} />
        </SelectItem>
        <SelectItem value={"tithe"}>
          <TypeItem type={"tithe"} />
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

const TypeItem = ({ type }: { type: "session" | "tithe" }) => {
  return (
    <div className="flex items-center gap-4 ml-2">
      <div className={cn(
        "w-3 h-3 rounded-full",
        type === "session" && "bg-purple-900",
        type === "tithe" && "bg-orange-600"
      )} />
      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
    </div>
  );
};
