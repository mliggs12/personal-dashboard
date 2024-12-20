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
import type * as beliefs from "../beliefs.js";
import type * as chats from "../chats.js";
import type * as emotions from "../emotions.js";
import type * as http from "../http.js";
import type * as intentions from "../intentions.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as recurringTasks from "../recurringTasks.js";
import type * as schedules from "../schedules.js";
import type * as sessions from "../sessions.js";
import type * as sleepRecords from "../sleepRecords.js";
import type * as statements from "../statements.js";
import type * as tasks from "../tasks.js";
import type * as userHelpers from "../userHelpers.js";
import type * as users from "../users.js";
import type * as waterLogEntries from "../waterLogEntries.js";
import type * as waterLogHelpers from "../waterLogHelpers.js";

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
  beliefs: typeof beliefs;
  chats: typeof chats;
  emotions: typeof emotions;
  http: typeof http;
  intentions: typeof intentions;
  messages: typeof messages;
  notes: typeof notes;
  recurringTasks: typeof recurringTasks;
  schedules: typeof schedules;
  sessions: typeof sessions;
  sleepRecords: typeof sleepRecords;
  statements: typeof statements;
  tasks: typeof tasks;
  userHelpers: typeof userHelpers;
  users: typeof users;
  waterLogEntries: typeof waterLogEntries;
  waterLogHelpers: typeof waterLogHelpers;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
