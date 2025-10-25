"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useMutation } from "convex/react";

import {
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

import { statuses } from "../data/data";

interface IntentionStatusSelectProps {
  intention: Doc<"intentions">;
  onSuccess?: () => void;
}

export function IntentionStatusSelect({ intention, onSuccess }: IntentionStatusSelectProps) {
  const updateIntention = useMutation(api.intentions.update);
  const { toast } = useToast();

  const currentStatus = statuses.find((s) => s.value === intention.status);

  const handleStatusChange = async (status: string) => {
    try {
      await updateIntention({
        id: intention._id,
        status: status as "draft" | "tithe" | "allow" | "done",
      });

      toast({
        title: "Status updated",
        duration: 2000,
      });

      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Status update complete
    }
  };

  return (
    <Select
      value={intention.status || "draft"}
      onValueChange={handleStatusChange}
    >
      <SelectPrimitive.Trigger className="flex items-center gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0 rounded px-2 py-1 whitespace-nowrap">
        {currentStatus?.icon}
        <span className="text-sm">{currentStatus?.label}</span>
      </SelectPrimitive.Trigger>
      <SelectContent>
        {statuses.map((item, index) => (
          <SelectItem key={index} value={item.value}>
            <div className="flex items-center gap-2">
              {item.icon}
              <span>{item.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

