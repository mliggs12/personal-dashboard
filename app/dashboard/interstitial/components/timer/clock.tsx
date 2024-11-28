import { secondsToMinutesAndSeconds } from "./time";

export default function Clock(props: any) {
  const time = props.time ? props.time : 0;
  const [minuteFirstChar, minuteSecondChar, secondFirstChar, secondSecondChar] =
    secondsToMinutesAndSeconds(time);
  return (
    <div>
      <span className="h-14 xl:h-44 w-12 xl:w-36 py-2 px-1 bg-background">
        {minuteFirstChar}
      </span>
      <span className="h-14 xl:h-44 w-12 xl:w-36 py-2 px-1 bg-background">
        {minuteSecondChar}
      </span>
      <span className="h-16 xl:h-48">:</span>
      <span className="h-14 xl:h-44 w-12 xl:w-36 py-2 px-1 bg-background">
        {secondFirstChar}
      </span>
      <span className="h-14 xl:h-44 w-12 xl:w-36 py-2 px-1 bg-background">
        {secondSecondChar}
      </span>
    </div>
  );
}
