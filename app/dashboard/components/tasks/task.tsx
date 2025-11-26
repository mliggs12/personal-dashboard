import dayjs from "@/lib/dayjs.config";
import { Repeat } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

import EditTaskDialog from "./edit-task-dialog";

function displayDueDate(dueDateString: string) {
  const dueDate = dayjs(dueDateString, "YYYY-MM-DD");
  const today = dayjs().startOf("day");

  if (dueDate.isToday()) {
    return "Today";
  } else if (dueDate.isYesterday()) {
    return "Yesterday";
  } else {
    return dueDate.from(today);
  }
}

export default function Task({
  data,
  isCompleted,
  handleOnChange,
}: {
  data: Doc<"tasks">;
  isCompleted: boolean;
   
  handleOnChange: () => void;
}) {
  const { name, due, recurringTaskId } = data;

  return (
    <div
      key={data._id}
      className="py-8 sm:py-6 px-1 pr-2 border-b w-full flex justify-between space-x-2 animate-in fade-in hover:bg-secondary hover:cursor-pointer"
    >
      <Dialog>
        <div className="flex gap-2 items-center justify-end w-full">
          <div className="flex px-2 gap-4 items-center w-full">
            <Checkbox
              id="task"
              className={
                cn(
                  "w-6 h-6 sm:w-5 sm:h-5",
                  "transition-all duration-200 ease-in-out",
                  "hover:scale-105 active:scale-95",
                  isCompleted
                    ? "bg-gray-300 border-gray-300"
                    : "hover:bg-secondary/50 hover:border-primary/70"
                )
              }
              checked={isCompleted}
              onCheckedChange={handleOnChange}
            />
            {/* represents the item row in the list */}
            <DialogTrigger asChild>
              <div className="flex justify-between items-center w-full">
                <button
                  className={cn(
                    "sm:text-sm font-normal text-left",
                    isCompleted && "line-through text-foreground/30",
                  )}
                >
                  {name}
                </button>
                <div className="flex justify-end items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Repeat
                          className={cn(
                            "hidden w-3 h-3 text-muted-foreground",
                            recurringTaskId && "flex",
                          )}
                        />
                      </TooltipTrigger>
                      {/* TODO: show recur type */}
                      <TooltipContent>
                        <p>{"Recurring"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {/* TODO: add tooltip */}
                  {due && (
                    <p
                      className={cn(
                        "w-[70px] text-xs text-right text-muted-foreground text-nowrap",
                        dayjs(due, "YYYY-MM-DD").isBefore(dayjs().startOf("day")) &&
                        "text-destructive",
                      )}
                    >
                      {displayDueDate(due)}
                    </p>
                  )}
                </div>
              </div>
            </DialogTrigger>
          </div>
          <EditTaskDialog data={data} />
        </div>
      </Dialog>
    </div>
  );
}
