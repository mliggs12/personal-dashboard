// Centralized dayjs configuration for Convex server-side code
// All dayjs plugin extensions are configured here to avoid duplication

import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Extend dayjs with plugins needed for Convex functions
dayjs.extend(isToday);
dayjs.extend(timezone);
dayjs.extend(utc);

// Export the configured dayjs instance
export default dayjs;

