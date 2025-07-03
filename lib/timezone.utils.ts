// utils/timezone.ts
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getUserTimezone = (): string => {
  return dayjs.tz.guess(); // Returns IANA timezone like "America/New_York"
};
