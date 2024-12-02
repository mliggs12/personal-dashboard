import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { completeTask } from "../../tasks/actions";
import Task from "./task";

export default function TaskList({ tasks }: { tasks: Doc<"tasks">[] }) {
  const { toast } = useToast();

  const unCompleteTask = useMutation(api.tasks.unCompleteTask);

  const handleOnChangeTask = (task: Doc<"tasks">) => {
    if (task.completed !== undefined) {
      unCompleteTask({ taskId: task._id });
    } else {
      completeTask(task._id);
      toast({
        title: "Task completed",
        description: "Appreciate yourself for completing the task!",
        duration: 3000,
      });
    }
  };
  return (
    <div className="overflow-y-auto">
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
