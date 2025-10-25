import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

// Run hourly to check if it's 6am local time (America/Denver)
// The internal mutation checks the local time and only executes at 6am Mountain Time
// Logic: Status changed to "allow" on day X (any time) -> Updates to "tithe" on day X+4
// Example: Changed to "allow" on Jan 2nd -> Updates to "tithe" on Jan 6th at 6am local time
// Note: Tracks allowedAt timestamp to avoid issues with other field updates (emotion, notes, etc.)
crons.hourly(
  "update ready to tithe intentions",
  { minuteUTC: 0 },
  internal.intentions.updateReadyToTitheIntentions
);

export default crons;

