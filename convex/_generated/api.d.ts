/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.12.1.
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
import type * as intentions from "../intentions.js";
import type * as intentions_handler from "../intentions_handler.js";
import type * as notes from "../notes.js";
import type * as projects from "../projects.js";
import type * as schedules from "../schedules.js";
import type * as sessions from "../sessions.js";
import type * as statements from "../statements.js";
import type * as tasks from "../tasks.js";
import type * as water_logs from "../water_logs.js";

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
  intentions: typeof intentions;
  intentions_handler: typeof intentions_handler;
  notes: typeof notes;
  projects: typeof projects;
  schedules: typeof schedules;
  sessions: typeof sessions;
  statements: typeof statements;
  tasks: typeof tasks;
  water_logs: typeof water_logs;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
