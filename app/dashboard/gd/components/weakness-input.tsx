"use client";

import { X } from "lucide-react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { z } from "zod";

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

import { DAMAGE_TYPES } from "../lib/types";

interface WeaknessInputProps {
  form: UseFormReturn<FieldValues>;
  index: number;
  onRemove: () => void;
  weaknesses: Array<{ type: string; multiplier: number }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function WeaknessInput({ form, index, onRemove, open, onOpenChange }: WeaknessInputProps) {

  return (
    <div className="flex gap-2 items-start">
      <FormField
        control={form.control}
        name={`weaknesses.${index}.type`}
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
      <FormField
        control={form.control}
        name={`weaknesses.${index}.multiplier`}
        render={({ field }) => (
          <FormItem className="w-32">
            <FormLabel>Multiplier</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(parseFloat(value))}
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Multiplier" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0.5">50%</SelectItem>
                <SelectItem value="1.0">100%</SelectItem>
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

