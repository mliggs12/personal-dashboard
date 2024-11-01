import { Doc } from "@/convex/_generated/dataModel";
import Task from "./task";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export default function TaskList({ tasks }: { tasks: Doc<"tasks">[] }) {
  const { toast } = useToast();

  const completeTask = useMutation(api.tasks.completeTask);
  const unCompleteTask = useMutation(api.tasks.unCompleteTask);

  const handleOnChangeTask = (task: Doc<"tasks">) => {
    if (task.completed !== undefined) {
      unCompleteTask({ taskId: task._id });
    } else {
      completeTask({ taskId: task._id });
      toast({
        title: "Task completed!",
        description: "Appreciate yourself for completing the task!",
        duration: 3000,
      });
    }
  };
  return (
    <div className="h-[350px] flex flex-col gap-2 overflow-y-auto">
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
