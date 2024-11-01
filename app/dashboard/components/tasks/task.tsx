import { Checkbox } from "@/components/ui/checkbox";
import dayjs from "dayjs";
import { Doc } from "@/convex/_generated/dataModel";
import { Calendar, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddTaskDialog from "./add-task-dialog";

export default function Task({
  data,
  isCompleted,
  handleOnChange,
  showDetails = false,
}: {
  data: Doc<"tasks">;
  isCompleted: boolean;
  handleOnChange: any;
  showDetails?: boolean;
}) {
  const { name, due } = data;

  return (
    <div
      key={data._id}
      className="flex items-center space-x-2 border-b-2 p-2 animate-in fade-in"
    >
      <Dialog>
        <div className="flex gap-2 items-center justify-end w-full">
          <div className="flex gap-4 items-center w-full">
            <Checkbox
              id="task"
              className={cn(
                "w-5 h-5",
                isCompleted &&
                  "data-[state=checked]:bg-gray-300 border-gray-300",
              )}
              checked={isCompleted}
              onCheckedChange={handleOnChange}
            />
            <DialogTrigger asChild>
              <div className="flex flex-col items-start">
                <button
                  className={cn(
                    "text-left",
                    isCompleted && "line-through text-foreground/30",
                  )}
                >
                  {name}
                </button>
                {showDetails && (
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center gap-1">
                      <GitBranch className="w-3 h-3 text-foreground/70" />
                      <p className="text-xs text-foreground/70"></p>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 text-primary" />
                      <p className="text-xs text-primary">
                        {due ? dayjs(due).format("ddd MMM D") : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogTrigger>
          </div>
          <AddTaskDialog data={data} />
        </div>
      </Dialog>
    </div>
  );
}
