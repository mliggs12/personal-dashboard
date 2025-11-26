import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(timezone);
dayjs.extend(utc);


export default function TestPage() {
    const tz = "America/Denver";
    const tzGuess = dayjs.tz.guess();
    return (
        <div className="px-4">
        <p>Dayjs: {dayjs().toISOString()}</p>
        <p>Dayjs: {dayjs().startOf("day").toISOString()}</p>
        <p>new Date(): {new Date().toISOString()}</p>
        <p>tz: {tz}</p>
        <p>tzGuess: {tzGuess}</p>
        <p>Dayjs tz({tz}): {dayjs().tz(tz).toISOString()}</p>
        <p>Dayjs UTC: {dayjs().utc().toISOString()}</p>
    </div>
  );
}