"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { DAMAGE_TYPES } from "../lib/types";

interface ResistanceInputProps {
  form: UseFormReturn<any>;
  index: number;
  onRemove: () => void;
  resistances: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResistanceInput({ form, index, onRemove, resistances, open, onOpenChange }: ResistanceInputProps) {

  return (
    <div className="flex gap-2 items-start">
      <FormField
        control={form.control}
        name={`resistances.${index}`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Type</FormLabel>
            <Select 
              open={open} 
              onOpenChange={onOpenChange}
              onValueChange={(value) => {
                field.onChange(value);
                // Close dropdown after selection
                onOpenChange?.(false);
              }} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DAMAGE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="mt-8"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

