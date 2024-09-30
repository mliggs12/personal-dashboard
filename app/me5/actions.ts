"use server";

import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export async function addMindDumpStatement(text: string) {
  await fetchMutation(api.mindDumpStatements.create, { text });
}
