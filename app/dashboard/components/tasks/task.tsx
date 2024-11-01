import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Checkbox } from "@/components/ui/checkbox";
import { Doc } from "@/convex/_generated/dataModel";
import { Calendar, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddTaskDialog from "./add-task-dialog";

dayjs.extend(relativeTime);

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
  const today = dayjs().startOf("day");

  return (
    <div
      key={data._id}
      className="w-full flex items-center justify-between space-x-2 border-b p-2 pb-4 animate-in fade-in"
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
              <div className="flex justify-between items-center w-full">
                <button
                  className={cn(
                    "",
                    isCompleted && "line-through text-foreground/30",
                  )}
                >
                  {name}
                </button>
                {due && (
                  <p
                    className={cn(
                      "w-[70px] text-xs text-right text-muted-foreground",
                      dayjs(due) < today && "text-destructive",
                    )}
                  >
                    {due ? dayjs(due).format("ddd MMM D") : ""}
                  </p>
                )}
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
