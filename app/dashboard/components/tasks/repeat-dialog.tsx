"use client";

import { useState, useEffect } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { CustomFrequencyDialog } from "./custom-frequency-dialog";

interface RecurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    frequency: "daily" | "weekly" | "monthly" | "custom";
    recurrenceType: "schedule" | "completion";
    customInterval?: {
      amount: number;
      unit: "day" | "week" | "month" | "year";
      daysOfWeek?: number[];
    };
  }) => void;
  initialData?: {
    frequency?: "daily" | "weekly" | "monthly" | "custom";
    recurrenceType?: "schedule" | "completion";
    customInterval?: {
      amount: number;
      unit: "day" | "week" | "month" | "year";
      daysOfWeek?: number[];
    };
  };
}

export function RecurDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: RepeatDialogProps) {
  const isMobile = useIsMobile();
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "custom">(
    initialData?.frequency || "daily"
  );
  const [recurrenceType, setRecurrenceType] = useState<"schedule" | "completion">(
    initialData?.recurrenceType || "completion"
  );
  const [customInterval, setCustomInterval] = useState<
    | {
        amount: number;
        unit: "day" | "week" | "month" | "year";
        daysOfWeek?: number[];
      }
    | undefined
  >(initialData?.customInterval);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFrequency(initialData.frequency || "daily");
        setRecurrenceType(initialData.recurrenceType || "completion");
        setCustomInterval(initialData.customInterval);
      } else {
        setFrequency("daily");
        setRecurrenceType("completion");
        setCustomInterval(undefined);
      }
    }
  }, [open, initialData]);

  const handleSave = () => {
    onSave({
      frequency,
      recurrenceType,
      customInterval: frequency === "custom" ? customInterval : undefined,
    });
    onOpenChange(false);
  };

  const handleFrequencyChange = (value: "daily" | "weekly" | "monthly" | "custom") => {
    if (value === "custom") {
      setIsCustomDialogOpen(true);
    } else {
      setFrequency(value);
      setCustomInterval(undefined);
    }
  };

  const handleCustomSave = (data: {
    recurrenceType: "schedule" | "completion";
    interval: {
      amount: number;
      unit: "day" | "week" | "month" | "year";
    };
    daysOfWeek?: number[];
  }) => {
    setFrequency("custom");
    setRecurrenceType(data.recurrenceType);
    setCustomInterval({
      amount: data.interval.amount,
      unit: data.interval.unit,
      daysOfWeek: data.daysOfWeek,
    });
    setIsCustomDialogOpen(false);
  };

  const content = (
    <div className="space-y-6">
      {/* Frequency Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Frequency</Label>
        <Select
          value={frequency}
          onValueChange={handleFrequencyChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <Separator />
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recurrence Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Recurring Type</Label>
        <Select
          value={recurrenceType}
          onValueChange={(value: "schedule" | "completion") =>
            setRecurrenceType(value)
          }
        >
          <SelectTrigger className="w-full bg-muted/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completion">By Due Dates</SelectItem>
            <SelectItem value="schedule">On Schedule</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
              <DrawerTitle>Recur</DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8"
              >
                <Check className="h-5 w-5" />
              </Button>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto">{content}</div>
          </DrawerContent>
        </Drawer>
        <CustomFrequencyDialog
          open={isCustomDialogOpen}
          onOpenChange={setIsCustomDialogOpen}
          onSave={handleCustomSave}
          initialData={{
            recurrenceType,
            interval: customInterval,
            daysOfWeek: customInterval?.daysOfWeek,
          }}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-0 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex-1 text-center">Recur</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="absolute right-12 top-0 h-8 w-8"
            >
              <Check className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="py-4">{content}</div>
        </DialogContent>
      </Dialog>
      <CustomFrequencyDialog
        open={isCustomDialogOpen}
        onOpenChange={setIsCustomDialogOpen}
        onSave={handleCustomSave}
        initialData={{
          recurrenceType,
          interval: customInterval,
          daysOfWeek: customInterval?.daysOfWeek,
        }}
      />
    </>
  );
}

