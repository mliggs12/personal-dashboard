import { Dispatch, SetStateAction, useState } from "react";
import { Plus } from "lucide-react";

import { Doc } from "@/convex/_generated/dataModel";

import AddTaskDialog from "./add-task-dialog";

export const AddTaskWrapper = ({
  parentTask,
}: {
  parentTask?: Doc<"tasks">;
}) => {
  const [showAddTask, setShowAddTask] = useState(false);

  return showAddTask ? (
    <AddTaskDialog
      setShowAddTask={setShowAddTask}
      parentTask={parentTask}
    />
  ) : (
    <AddTaskButton
      onClick={() => setShowAddTask(true)}
      name={"Add task"}
    />
  );
};

export default function AddTaskButton({
  onClick,
  name,
}: {
  onClick: Dispatch<SetStateAction<any>>;
  name: string;
}) {
  return (
    <button
      className="pl-2 mt-2 flex flex-1 bg-background hover:bg-background"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center gap-1 text-center">
        <div className="flex items-center gap-2 justify-center">
          <Plus className="h-4 w-4 text-primary hover:bg-primary hover:text-background hover:rounded-xl" />
          <h3 className="text-base font-light tracking-tight text-foreground/70">
            {name}
          </h3>
        </div>
      </div>
    </button>
  );
}
