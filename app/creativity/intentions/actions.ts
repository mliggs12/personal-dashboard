"use server";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { fetchMutation, fetchQuery, preloadQuery } from "convex/nextjs";

export async function addIntention(
  title: string,
  whatStatements?: string[],
  whyStatements?: string[],
  emotionIds?: Id<"emotions">[],
  notes?: string,
) {
  if (!whatStatements) {
    whatStatements = [];
  }

  if (!whyStatements) {
    whyStatements = [];
  }

  if (!emotionIds) {
    emotionIds = [];
  }

  if (!notes) {
    notes = "";
  }

  await fetchMutation(api.intentions.createIntention, {
    title,
    status: "draft",
    whatStatements,
    whyStatements,
    emotionIds,
    notes,
  });
}

export async function getIntention(id: Id<"intentions">) {
  return await fetchQuery(api.intentions.getIntention, { intentionId: id });
}

export async function deleteIntention(id: Id<"intentions">) {
  try {
    await fetchMutation(api.intentions.deleteIntention, { id });
    console.log("Intention deleted successfully");
  } catch (error) {
    console.error("Error deleting the intention:", error);
  }
}

export async function preloadIntentions() {
  return await preloadQuery(api.intentions.list);
}
