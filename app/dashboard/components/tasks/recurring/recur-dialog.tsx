"use client";

import { useState, useEffect, useMemo, startTransition } from "react";
import { Check } from "lucide-react";
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { CustomFrequencyDialog } from "./custom-frequency-dialog";
import { formatDaysOfWeek, getCurrentDayOfWeek, getCurrentDayName } from "./recurrence-utils";

interface RecurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    frequency: "none" | "daily" | "weekly" | "monthly" | "yearly" | "weekday" | "custom";
    recurrenceType: "schedule" | "completion";
    customInterval?: {
      amount: number;
      unit: "day" | "week" | "month" | "year";
      daysOfWeek?: number[];
    };
  }) => void;
  initialData?: {
    frequency?: "none" | "daily" | "weekly" | "monthly" | "yearly" | "weekday" | "custom";
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
}: RecurDialogProps) {
  const isMobile = useIsMobile();
  
  // Compute initial values based on initialData
  const initialValues = useMemo(() => {
    if (initialData) {
      return {
        frequency: initialData.frequency || "none" as const,
        recurrenceType: initialData.recurrenceType || "completion" as const,
        customInterval: initialData.customInterval,
      };
    }
    return {
      frequency: "none" as const,
      recurrenceType: "completion" as const,
      customInterval: undefined as undefined,
    };
  }, [initialData]);

  const [frequency, setFrequency] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly" | "weekday" | "custom">(
    initialValues.frequency
  );
  const [recurrenceType, setRecurrenceType] = useState<"schedule" | "completion">(
    initialValues.recurrenceType
  );
  const [customInterval, setCustomInterval] = useState<
    | {
        amount: number;
        unit: "day" | "week" | "month" | "year";
        daysOfWeek?: number[];
      }
    | undefined
  >(initialValues.customInterval);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  // Reset state when dialog opens with new initialData
  useEffect(() => {
    if (open) {
      startTransition(() => {
        setFrequency(initialValues.frequency);
        setRecurrenceType(initialValues.recurrenceType);
        setCustomInterval(initialValues.customInterval);
      });
    }
  }, [open, initialValues]);

  const handleOptionClick = (value: "none" | "daily" | "weekly" | "monthly" | "yearly" | "weekday" | "custom") => {
    if (value === "custom") {
      setIsCustomDialogOpen(true);
    } else {
      setFrequency(value);
      setCustomInterval(undefined);
      // Auto-save and close for all non-Custom options
      if (value === "none") {
        onSave({
          frequency: "none",
          recurrenceType: "completion",
          customInterval: undefined,
        });
      } else {
        // Daily, Monthly, Yearly, and Weekday default to "schedule" (By Completion Dates)
        if (value === "weekly") {
          // For Weekly, set the current day of the week
          onSave({
            frequency: value,
            recurrenceType: "schedule",
            customInterval: {
              amount: 1,
              unit: "week",
              daysOfWeek: [getCurrentDayOfWeek()],
            },
          });
        } else {
          onSave({
            frequency: value,
            recurrenceType: "schedule",
            customInterval: undefined,
          });
        }
      }
      onOpenChange(false);
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
    const customIntervalData = {
      amount: data.interval.amount,
      unit: data.interval.unit,
      daysOfWeek: data.daysOfWeek,
    };
    
    // Save and close both dialogs
    onSave({
      frequency: "custom",
      recurrenceType: data.recurrenceType,
      customInterval: customIntervalData,
    });
    setIsCustomDialogOpen(false);
    onOpenChange(false);
  };

  const getWeeklyLabel = () => {
    if (frequency === "custom" && customInterval?.unit === "week" && customInterval?.daysOfWeek && customInterval.daysOfWeek.length > 0) {
      return `Weekly (${formatDaysOfWeek(customInterval.daysOfWeek)})`;
    }
    // Check if weekly is selected and has days in initialData or customInterval
    const weeklyDays = initialData?.customInterval?.daysOfWeek || customInterval?.daysOfWeek;
    if (frequency === "weekly" && weeklyDays && weeklyDays.length > 0) {
      return `Weekly (${formatDaysOfWeek(weeklyDays)})`;
    }
    // Always show current day as preview, even when not selected
    return `Weekly (${getCurrentDayName()})`;
  };

  const getCustomLabel = () => {
    if (customInterval) {
      const { amount, unit, daysOfWeek } = customInterval;
      const unitLabel = unit === "day" ? "day" : unit === "week" ? "week" : unit === "month" ? "month" : "year";
      const pluralUnit = amount !== 1 ? `${unitLabel}s` : unitLabel;
      
      if (unit === "week" && daysOfWeek && daysOfWeek.length > 0) {
        const dayNames = formatDaysOfWeek(daysOfWeek);
        if (amount === 1) {
          return `Custom (Weekly on ${dayNames})`;
        } else {
          return `Custom (Every ${amount} weeks on ${dayNames})`;
        }
      }
      
      return `Custom (Every ${amount} ${pluralUnit})`;
    }
    return "Custom";
  };

  const options = [
    { value: "none" as const, label: "None" },
    { value: "daily" as const, label: "Daily" },
    { value: "weekly" as const, label: getWeeklyLabel() },
    { value: "monthly" as const, label: "Monthly" },
    { value: "yearly" as const, label: "Yearly" },
    { value: "weekday" as const, label: "Every Weekday (Mon - Fri)" },
    { value: "custom" as const, label: getCustomLabel() },
  ];

  const content = (
    <div className="space-y-1">
      {options.map((option) => {
        const isSelected = frequency === option.value;
        const showSeparatorAfter = option.value === "yearly";
        const showSeparatorBefore = option.value === "custom";
        
        return (
          <div key={option.value}>
            {showSeparatorBefore && <Separator className="my-1" />}
            <button
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={cn(
                "w-full flex items-center justify-between p-2 text-left hover:bg-muted/50 transition-colors",
                isSelected && "text-primary"
              )}
            >
              <span className={cn("text-sm", isSelected && "font-medium")}>
                {option.label}
              </span>
              {isSelected && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
            {showSeparatorAfter && <Separator className="my-1" />}
          </div>
        );
      })}
      
    </div>
  );

  const handleCancel = () => {
    setFrequency("none");
    onOpenChange(false);
  };

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[90vh] p-4 gap-4">
            <DrawerHeader className="px-2 py-0 text-left">
              <DrawerTitle>Recur</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto">{content}</div>
            <DrawerFooter className="p-0 items-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive uppercase"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </DrawerFooter>
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
        <DialogContent className="sm:max-w-sm p-2 gap-1">
          <DialogHeader>
            <DialogTitle className="text-left p-2">Recur</DialogTitle>
          </DialogHeader>
          <div>{content}</div>
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

