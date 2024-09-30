"use client";

import { api } from "@/convex/_generated/api";
import {
  Preloaded,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { Doc } from "@/convex/_generated/dataModel";
import Task from "./task";
import { useEffect, useState } from "react"; // Add this import

export default function TaskList(props: {
  preloadedTasks: Preloaded<typeof api.tasks.incompleteTasks>;
}) {
  const incompleteTasks = usePreloadedQuery(props.preloadedTasks);
  const preselectTask = useMutation(api.tasks.preselectTask);
  const unPreselectTask = useMutation(api.tasks.unPreselectTask);

  if (incompleteTasks === undefined) {
    <p>Loading...</p>;
  }

  useEffect(() => {
    if (incompleteTasks.length > 0) {
      preselectTask({ taskId: incompleteTasks[0]._id });
    }
  }, [incompleteTasks, preselectTask]);

  const [preselectedTasks, setPreselectedTasks] = useState([]);

  const handleOnChangeTask = async (task: Doc<"tasks">) => {
    if (task.isPreselected) {
      await unPreselectTask({ taskId: task._id });
    } else {
      await preselectTask({ taskId: task._id });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-2 mt-2">
        <h1 className="text-4xl font-semibold">
          Preselect Tasks - What do I want to do more than
          [lastPreselectedTask]?
        </h1>
      </div>
      <div className="flex flex-col gap-1 py-4">
        {incompleteTasks.map((task: Doc<"tasks">) => (
          <Task
            key={task._id}
            data={task}
            isPreselected={task.isPreselected ?? false}
            handleOnChange={() => handleOnChangeTask(task)}
          />
        ))}
      </div>
    </>
  );
}
