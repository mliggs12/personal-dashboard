"use client"

import { useMutation } from "convex/react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

import Task from "./task";
import { completeTask } from "../../tasks/actions";

dayjs.extend(timezone);
dayjs.extend(utc);

export default function TaskList({ tasks }: { tasks: Doc<"tasks">[] }) {
  const { toast } = useToast();

  const localTimezone = dayjs.tz.guess();

  const todayStart = dayjs().tz(localTimezone).startOf("day").valueOf();

  const unCompleteTask = useMutation(api.tasks.unCompleteTask);

  const handleOnChangeTask = (task: Doc<"tasks">) => {
    if (task.completed !== undefined) {
      unCompleteTask({ taskId: task._id });
    } else {
      completeTask(task._id, todayStart);
      toast({
        title: "Task completed",
        description: "Appreciate yourself for completing the task!",
        duration: 1500,
      });
    }
  };

  return (
    <div className="absolute w-full">
      {tasks.map((task) => (
        <Task
          key={task._id}
          data={task}
          isCompleted={task.completed !== undefined}
          handleOnChange={() => handleOnChangeTask(task)}
        />
      ))}
    </div>
  );
}
