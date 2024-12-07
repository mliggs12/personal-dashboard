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
import type * as emotions from "../emotions.js";
import type * as http from "../http.js";
import type * as intentions from "../intentions.js";
import type * as notes from "../notes.js";
import type * as recurringTasks from "../recurringTasks.js";
import type * as schedules from "../schedules.js";
import type * as sessions from "../sessions.js";
import type * as statements from "../statements.js";
import type * as tasks from "../tasks.js";
import type * as userHelpers from "../userHelpers.js";
import type * as users from "../users.js";
import type * as waterLog from "../waterLog.js";

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
  emotions: typeof emotions;
  http: typeof http;
  intentions: typeof intentions;
  notes: typeof notes;
  recurringTasks: typeof recurringTasks;
  schedules: typeof schedules;
  sessions: typeof sessions;
  statements: typeof statements;
  tasks: typeof tasks;
  userHelpers: typeof userHelpers;
  users: typeof users;
  waterLog: typeof waterLog;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
