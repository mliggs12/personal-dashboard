"use client";

import { useState, useEffect, useMemo, startTransition } from "react";
import { Check, X, HelpCircle } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK_OBJECTS, calculateNextWeeklyOccurrence, getDayOfWeekFromDate } from "./recurrence-utils";
import { RecurTypeHelpDialog } from "./recur-type-help-dialog";

interface CustomFrequencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    recurrenceType: "schedule" | "completion";
    interval: {
      amount: number;
      unit: "day" | "week" | "month" | "year";
    };
    daysOfWeek?: number[];
  }) => void;
  initialData?: {
    recurrenceType?: "schedule" | "completion";
    interval?: {
      amount: number;
      unit: "day" | "week" | "month" | "year";
    };
    daysOfWeek?: number[];
  };
  currentDueDate?: Date | undefined;
  onSetDueDate?: (date: Date) => void;
}

const UNITS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

export function CustomFrequencyDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  currentDueDate,
  onSetDueDate,
}: CustomFrequencyDialogProps) {
  const isMobile = useIsMobile();
  
  // Helper to get reference date (due date or today)
  const getReferenceDate = () => {
    return currentDueDate || new Date();
  };
  
  // Compute initial values based on initialData
  const initialValues = useMemo(() => {
    if (initialData?.interval) {
      const days = initialData.daysOfWeek || [];
      const recurrenceType = initialData.recurrenceType || "schedule";
      // Ensure at least one day is selected for weekly with schedule type
      // Use due date's day or today if no days selected
      const selectedDays = 
        initialData.interval.unit === "week" && 
        recurrenceType === "schedule" && 
        days.length === 0
          ? [getDayOfWeekFromDate(getReferenceDate())] // Default to due date's day or today
          : days;
      
      return {
        recurrenceType,
        amount: initialData.interval.amount,
        unit: initialData.interval.unit,
        selectedDays,
      };
    }
    
    // Default values when opening fresh - use due date's day or today
    const refDate = getReferenceDate();
    return {
      recurrenceType: "schedule" as const,
      amount: 1,
      unit: "week" as const,
      selectedDays: [getDayOfWeekFromDate(refDate)],
    };
  }, [initialData, currentDueDate]);

  const [recurrenceType, setRecurrenceType] = useState<"schedule" | "completion">(
    initialValues.recurrenceType
  );
  const [amount, setAmount] = useState(initialValues.amount);
  const [unit, setUnit] = useState<"day" | "week" | "month" | "year">(
    initialValues.unit
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialValues.selectedDays
  );
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  // Reset state when dialog opens with new initialData
  useEffect(() => {
    if (open) {
      startTransition(() => {
        setRecurrenceType(initialValues.recurrenceType);
        setAmount(initialValues.amount);
        setUnit(initialValues.unit);
        setSelectedDays(initialValues.selectedDays);
      });
    }
  }, [open, initialValues]);

  const handleSave = () => {
    const data: {
      recurrenceType: "schedule" | "completion";
      interval: {
        amount: number;
        unit: "day" | "week" | "month" | "year";
      };
      daysOfWeek?: number[];
    } = {
      recurrenceType,
      interval: { amount, unit },
    };

    if (unit === "week" && selectedDays.length > 0) {
      data.daysOfWeek = selectedDays;
      
      // Always update due date when checkmark is pressed (not when X/close is pressed)
      // Calculate next occurrence based on selected days
      if (recurrenceType === "schedule" && onSetDueDate) {
        const refDate = getReferenceDate();
        const nextOccurrence = calculateNextWeeklyOccurrence(selectedDays, refDate);
        onSetDueDate(nextOccurrence);
      }
    }

    onSave(data);
    onOpenChange(false);
  };

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        // Prevent removing the last day when weekly is selected with schedule type
        if (unit === "week" && recurrenceType === "schedule" && prev.length === 1) {
          return prev; // Don't allow removing the last day
        }
        return prev.filter((d) => d !== dayValue);
      } else {
        return [...prev, dayValue];
      }
    });
  };

  const getSummaryText = () => {
    if (unit === "week" && selectedDays.length > 0) {
      const dayLabels = selectedDays
        .sort()
        .map((d) => DAYS_OF_WEEK_OBJECTS[d].label)
        .join(", ");
      return `Weekly on ${dayLabels}`;
    }
    return `Every ${amount} ${unit}${amount !== 1 ? "s" : ""}`;
  };

  const content = (
    <div className="space-y-6">
      {/* Recurring Type */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Recurring Type</Label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.preventDefault();
              setIsHelpDialogOpen(true);
            }}
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <Select
          value={recurrenceType}
          onValueChange={(value: "schedule" | "completion") => {
            setRecurrenceType(value);
            if (value === "completion") {
              // Clear selected days when switching to "By Completion Dates" (completion) type
              setSelectedDays([]);
            } else if (value === "schedule" && unit === "week" && selectedDays.length === 0) {
              // When switching to "By Schedule Dates" (schedule) with weekly, ensure at least one day is selected
              const refDate = getReferenceDate();
              setSelectedDays([getDayOfWeekFromDate(refDate)]); // Default to due date's day or today
            }
          }}
        >
          <SelectTrigger className="w-full bg-muted/50">
            <SelectValue />
          </SelectTrigger>
              <SelectContent side="bottom" avoidCollisions={isMobile}>
                <SelectItem value="schedule">By Schedule Dates</SelectItem>
                <SelectItem value="completion">By Completion Dates</SelectItem>
              </SelectContent>
        </Select>
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Frequency</Label>
        <div className="flex items-center gap-4">
          <span className="text-sm">Every</span>
          <div className="flex-1">
            <Select
              value={amount.toString()}
              onValueChange={(value) => setAmount(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" avoidCollisions={isMobile}>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={unit}
              onValueChange={(value: "day" | "week" | "month" | "year") => {
                setUnit(value);
                // When switching to weekly with schedule type, ensure at least one day is selected
                if (value === "week" && recurrenceType === "schedule" && selectedDays.length === 0) {
                  const refDate = getReferenceDate();
                  setSelectedDays([getDayOfWeekFromDate(refDate)]); // Default to due date's day or today
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" avoidCollisions={isMobile}>
                {UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Weekly Days Selector - Only show for "By Schedule Dates" (schedule) type */}
      {unit === "week" && recurrenceType === "schedule" && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{getSummaryText()}</Label>
          <div className="rounded-lg border bg-muted/50 p-3">
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK_OBJECTS.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDays.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 rounded-full",
                    selectedDays.includes(day.value) &&
                      "bg-primary text-primary-foreground"
                  )}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
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
                onClick={handleSave}
                className="h-8 w-8"
              >
                <Check className="h-5 w-5" />
              </Button>
              <DrawerTitle>Custom</DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto">{content}</div>
          </DrawerContent>
        </Drawer>
        <RecurTypeHelpDialog
          open={isHelpDialogOpen}
          onOpenChange={setIsHelpDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md p-0 gap-0 [&>button]:hidden">
          <DialogHeader className="flex flex-row items-center border-b px-4 py-3 space-y-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="h-8 w-8 flex items-center justify-center m-0"
            >
              <Check className="h-5 w-5" />
            </Button>
            <DialogTitle className="m-0 flex-1 text-center">Custom</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 flex items-center justify-center m-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          <div className="p-4 overflow-y-auto">{content}</div>
        </DialogContent>
      </Dialog>
      <RecurTypeHelpDialog
        open={isHelpDialogOpen}
        onOpenChange={setIsHelpDialogOpen}
      />
    </>
  );
}

