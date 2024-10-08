import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Clock from "./clock";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Timer({ initialLength }: { initialLength: number }) {
  const [time, setTime] = useState(initialLength);
  const [inputTime, setInputTime] = useState(initialLength.toString());
  const createSession = useMutation(api.sessions.create);

  useEffect(() => {
    setTime(initialLength);
    setInputTime(initialLength.toString());
  }, [initialLength]);

  function regressive(counter: number = 0) {
    setTimeout(() => {
      if (counter > 0) {
        setTime(counter - 1);
        return regressive(counter - 1);
      } else {
        createSession({
          duration: time * 1000,
        });
      }
    }, 1000);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTime(e.target.value);
  };

  const handleSetTime = () => {
    const newTime = parseInt(inputTime, 10);
    if (!isNaN(newTime) && newTime > 0) {
      setTime(newTime);
      setInputTime(newTime.toString());
    }
  };

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Timer</CardTitle>
        <CardDescription>Enter a duration and start the timer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Input
            type="number"
            value={inputTime}
            onChange={handleInputChange}
            className="p-2 border rounded mr-2 w-20"
          />
          <Button onClick={handleSetTime}>Set Time</Button>
        </div>
        <div className="flex flex-col items-center text-9xl space-y-10 mt-8">
          <Clock time={time} />
          <Button onClick={() => regressive(time)}>Start</Button>
        </div>
      </CardContent>
    </Card>
  );
}
