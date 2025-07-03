/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activities from "../activities.js";
import type * as banners from "../banners.js";
import type * as beliefs from "../beliefs.js";
import type * as chats from "../chats.js";
import type * as emotions from "../emotions.js";
import type * as focusBlocks from "../focusBlocks.js";
import type * as http from "../http.js";
import type * as inboxRecords from "../inboxRecords.js";
import type * as intentions from "../intentions.js";
import type * as journalEntries from "../journalEntries.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as nutritionix from "../nutritionix.js";
import type * as projects from "../projects.js";
import type * as recurringTasks from "../recurringTasks.js";
import type * as schedules from "../schedules.js";
import type * as scratchPads from "../scratchPads.js";
import type * as sleepRecords from "../sleepRecords.js";
import type * as statements from "../statements.js";
import type * as systemExerciseCategories from "../systemExerciseCategories.js";
import type * as systemExercises from "../systemExercises.js";
import type * as tasks from "../tasks.js";
import type * as timers from "../timers.js";
import type * as users from "../users.js";
import type * as waterLogEntries from "../waterLogEntries.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  banners: typeof banners;
  beliefs: typeof beliefs;
  chats: typeof chats;
  emotions: typeof emotions;
  focusBlocks: typeof focusBlocks;
  http: typeof http;
  inboxRecords: typeof inboxRecords;
  intentions: typeof intentions;
  journalEntries: typeof journalEntries;
  messages: typeof messages;
  notes: typeof notes;
  nutritionix: typeof nutritionix;
  projects: typeof projects;
  recurringTasks: typeof recurringTasks;
  schedules: typeof schedules;
  scratchPads: typeof scratchPads;
  sleepRecords: typeof sleepRecords;
  statements: typeof statements;
  systemExerciseCategories: typeof systemExerciseCategories;
  systemExercises: typeof systemExercises;
  tasks: typeof tasks;
  timers: typeof timers;
  users: typeof users;
  waterLogEntries: typeof waterLogEntries;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
