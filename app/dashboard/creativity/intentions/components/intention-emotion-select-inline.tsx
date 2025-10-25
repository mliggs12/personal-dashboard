"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useMutation, useQuery } from "convex/react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

interface IntentionEmotionSelectProps {
  intention: Doc<"intentions">;
  onSuccess?: () => void;
}

export function IntentionEmotionSelect({ intention, onSuccess }: IntentionEmotionSelectProps) {
  const updateIntention = useMutation(api.intentions.update);
  const emotions = useQuery(api.emotions.list) ?? [];
  const { toast } = useToast();

  const currentEmotion = emotions.find((e) => e._id === intention.emotionId);

  const getEmotionColor = (emotionId: string) => {
    const emotion = emotions?.find((e) => e._id === emotionId);
    if (!emotion) return "#6c757d";

    if (!emotion.color) {
      switch (emotion.label.toLowerCase()) {
        case "freedom":
          return "#4a90e2";
        case "fullness":
          return "#8e44ad";
        case "passion":
          return "#c0392b";
        case "joy":
          return "#f39c12";
        case "enjoyment":
          return "#27ae60";
        case "enthusiasm":
          return "#d35400";
        default:
          return "#6c757d";
      }
    }

    return emotion.color;
  };

  const handleEmotionChange = async (emotionId: string) => {
    try {
      await updateIntention({
        id: intention._id,
        emotionId: emotionId === "__no_emotion__" ? null : (emotionId as Id<"emotions">),
      });

      toast({
        title: "Emotion updated",
        duration: 2000,
      });

      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update emotion.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Emotion update complete
    }
  };

  return (
    <Select
      value={intention.emotionId || "__no_emotion__"}
      onValueChange={handleEmotionChange}
    >
      <SelectPrimitive.Trigger className="flex items-center gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0 rounded px-2 py-1 whitespace-nowrap">
        {currentEmotion ? (
          <Badge
            variant="outline"
            style={{
              backgroundColor: getEmotionColor(intention.emotionId ?? ""),
              color: "white",
            }}
          >
            {currentEmotion?.label}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">No emotion</span>
        )}
      </SelectPrimitive.Trigger>
      <SelectContent>
        <SelectItem value="__no_emotion__">
          <span className="text-sm text-muted-foreground">No emotion</span>
        </SelectItem>
        {emotions.map((emotion, index) => (
          <SelectItem key={index} value={emotion._id}>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: getEmotionColor(emotion._id),
                  color: "white",
                }}
              >
                {emotion.label}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

