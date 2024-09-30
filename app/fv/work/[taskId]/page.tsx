"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import PreselectedTasksList from "../preselected-tasks-list";

export default function TaskPage({
  params,
}: {
  params: { taskId: Id<"tasks"> };
}) {
  const router = useRouter();
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const task = useQuery(api.tasks.get, { taskId: params.taskId }); // Wrap taskId in an object
  const deleteTask = useMutation(api.tasks.deleteTask);
  const createTask = useMutation(api.tasks.createTask);
  const completeTask = useMutation(api.tasks.completeTask);
  const preselectedTasks = fetchQuery(api.tasks.preselectedTasks);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleFinish = async () => {
    await deleteTask({ taskId: params.taskId });
    if (task?.taskName) {
      await createTask({ taskName: task.taskName }); // Ensure taskName is defined
    }

    router.push("/fv");
  };

  const handleComplete = async () => {
    await completeTask({ taskId: params.taskId });
    router.push("/fv");
  };

  return (
    <main className="flex flex-col items-center h-screen p-6">
      <div>{/* <PreselectedTasksList /> */}</div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{task?.taskName}</h1>
        <p className="text-2xl mb-2">Time: {timer} seconds</p>
        <button
          onClick={handleStartStop}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isRunning ? "Stop" : "Start"}
        </button>
        <button
          onClick={handleFinish}
          className="px-4 py-2 bg-green-500 text-white rounded mt-4"
        >
          Finish
        </button>
        <button
          onClick={handleComplete}
          className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
        >
          Complete
        </button>
      </div>
    </main>
  );
}
