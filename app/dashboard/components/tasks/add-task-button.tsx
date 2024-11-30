import { Plus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

import { Button } from "@/components/ui/button";

import { Doc } from "@/convex/_generated/dataModel";
import AddTaskInline from "./add-task-inline";

export const AddTaskWrapper = ({
  parentTask,
}: {
  parentTask?: Doc<"tasks">;
}) => {
  const [showAddTask, setShowAddTask] = useState(false);

  return showAddTask ? (
    <AddTaskInline
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
    <Button
      className="pl-2 flex flex-1 bg-background hover:bg-secondary"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center gap-1 text-center">
        <div className="flex items-center gap-2 justify-center">
          <Plus className="h-4 w-4 text-primary bg-background hover:bg-accent hover:rounded-xl hover:text-black" />
          <h3 className="tracking-tight text-primary">{name}</h3>
        </div>
      </div>
    </Button>
  );
}
