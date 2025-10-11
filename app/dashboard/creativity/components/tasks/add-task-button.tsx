import { Dispatch, SetStateAction, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

import AddTaskInline from "./add-task-inline";

export const AddTaskWrapper = ({
  intentionId,
}: {
  intentionId: Id<"intentions">;
}) => {
  const [showAddTask, setShowAddTask] = useState(false);

  return showAddTask ? (
    <AddTaskInline
      setShowAddTask={setShowAddTask}
      intentionId={intentionId}
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
      className="pl-2 flex mt-2 flex-1 bg-background hover:bg-background"
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
