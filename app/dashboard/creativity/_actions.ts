"use server";

import { fetchMutation, fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function getEmotionById(emotionId: Id<"emotions">) {
  return await fetchQuery(api.emotions.labelById, { emotionId });
}

export async function updateIntentionEmotionByValue(
  intentionId: Id<"intentions">,
  emotionValue: string,
) {
  const emotion = await fetchQuery(api.emotions.getByValue, {
    value: emotionValue,
  });

  if (!emotion) {
    throw new Error("Emotion not found.");
  }

  await fetchMutation(api.intentions.update, {
    id: intentionId,
    emotionId: emotion._id,
  });
}
