import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import { Calendar, GitBranch, Repeat } from "lucide-react";

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

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);

function displayDueDate(dueDateString: string) {
  const dueDate = dayjs(dueDateString, "YYYY/MM/DD");
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
  showDetails = false,
}: {
  data: Doc<"tasks">;
  isCompleted: boolean;
  handleOnChange: any;
  showDetails?: boolean;
}) {
  const { name, due, recurringTaskId } = data;

  return (
    <div
      key={data._id}
      className="py-6 px-1 border-b w-full flex justify-between space-x-2 animate-in fade-in hover:bg-secondary hover:cursor-pointer"
    >
      <Dialog>
        <div className="flex gap-2 items-center justify-end w-full">
          <div className="flex px-2 gap-4 items-center w-full">
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
                    "text-sm font-normal text-left",
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
                      <TooltipContent>
                        <p>{"Recurring"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {due && (
                    <p
                      className={cn(
                        "w-[70px] text-xs text-right text-muted-foreground",
                        dayjs(due).isBefore(dayjs().startOf("day")) &&
                          "text-destructive",
                      )}
                    >
                      {displayDueDate(due)}
                    </p>
                  )}
                </div>
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
          <EditTaskDialog data={data} />
        </div>
      </Dialog>
    </div>
  );
}
