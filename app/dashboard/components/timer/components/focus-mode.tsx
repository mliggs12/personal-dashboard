"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import Clock from "./timer/clock";

interface FocusModeProps {
  isActive: boolean;
  intention: Doc<"intentions"> | null;
  timeRemaining: number;
  timerType: "session" | "tithe";
  onExit?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  isPaused?: boolean;
}

export default function FocusMode({ 
  isActive, 
  intention, 
  timeRemaining, 
  timerType,
  onExit,
  onPause,
  onStop,
  isPaused = false
}: FocusModeProps) {
  const emotions = useQuery(api.emotions.list);

  const getEmotionColor = (emotionId: string) => {
    const emotion = emotions?.find((e) => e._id === emotionId);
    if (!emotion) return "#6c757d"; // Subtle gray color if emotion not found

    if (!emotion.color) {
      // Assign a subtle color if none exists
      switch (emotion.label.toLowerCase()) {
        case "freedom":
          return "#4a90e2"; // Subtle blue
        case "fullness":
          return "#8e44ad"; // Subtle purple
        case "passion":
          return "#c0392b"; // Subtle red
        case "joy":
          return "#f39c12"; // Subtle yellow
        case "enjoyment":
          return "#27ae60"; // Subtle green
        case "enthusiasm":
          return "#d35400"; // Subtle orange
        default:
          return "#6c757d"; // Subtle gray
      }
    }

    return emotion.color;
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      {/* Intention Title */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-light text-foreground mb-4 flex items-center justify-center gap-4">
          {intention?.emotionId && (
            <div 
              className="w-6 h-6 rounded-full flex-shrink-0"
              style={{ backgroundColor: getEmotionColor(intention.emotionId) }}
            />
          )}
          {intention?.title || "Focus Session"}
        </h1>
        <p className="text-xl text-muted-foreground capitalize">
          {timerType} Mode
        </p>
      </div>

      {/* Timer Display */}
      <div className="mb-12">
        <Clock seconds={timeRemaining} />
      </div>

      {/* Control Symbols */}
      <div className="flex gap-8 mb-8">
        {onPause && (
          <button
            onClick={onPause}
            className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              // Play symbol (triangle)
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              // Pause symbol (two bars)
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            )}
          </button>
        )}
        {onStop && (
          <button
            onClick={onStop}
            className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            title={timerType === 'tithe' ? 'Finish Session' : 'Stop Session'}
          >
            {/* Stop symbol (square) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Subtle exit option */}
      {onExit && (
        <button
          onClick={onExit}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors text-sm"
        >
          Exit Focus Mode
        </button>
      )}

      {/* Breathing space indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
