import { getUserTimezone } from "@/lib/date.utils";
import dayjs from "@/lib/dayjs.config";

export default function TestPage() {
    const tz = "America/Denver";
    const tzGuess = dayjs.tz.guess();
    const tzGuess2 = getUserTimezone();
    
    return (
        <div className="px-4">
        <p>Dayjs: {dayjs().toISOString()}</p>
        <p>Dayjs: {dayjs().startOf("day").toISOString()}</p>
        <p>new Date(): {new Date().toISOString()}</p>
        <p>tz: {tz}</p>
        <p>tzGuess: {tzGuess}</p>
        <p>tzGuess2: {tzGuess2}</p>
        <p>Dayjs tz({tz}): {dayjs().tz(tz).toISOString()}</p>
        <p>Dayjs UTC: {dayjs().utc().toISOString()}</p>
    </div>
  );
}