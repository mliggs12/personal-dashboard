import { useQuery } from "convex/react";
import { Repeat } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import dayjs from "@/lib/dayjs.config";
import { formatTaskDate } from "@/lib/date.utils";
import { cn } from "@/lib/utils";

import EditTaskDialog from "./edit-task-dialog";
import { useRecurrenceText } from "./hooks/use-recurrence-text";

export default function Task({
  data,
  isCompleted,
  handleOnChange,
}: {
  data: Doc<"tasks">;
  isCompleted: boolean;
   
  handleOnChange: () => void;
}) {
  const { name, due, date, recurringTaskId, tagIds } = data;

  const recurrenceText = useRecurrenceText(recurringTaskId, date);
  const tags = useQuery(api.tags.getMany, { tagIds: tagIds || [] });

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
                <div className="flex justify-end items-center gap-2">
                  {tags && tags.length > 0 && (
                    <div className="flex gap-0.5">
                      {tags.slice(0, 3).map((tag) => (
                        <TooltipProvider key={tag._id}>
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{tag.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
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
                        <p>{recurrenceText || "Recurring"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {due && (
                    <p
                      className={cn(
                        "w-[70px] text-xs text-right text-muted-foreground text-nowrap font-medium",
                        dayjs(due, "YYYY-MM-DD").isBefore(dayjs().startOf("day")) &&
                        "text-destructive",
                      )}
                    >
                      {formatTaskDate(due)}
                    </p>
                  )}
                  {!due && date && (
                    <p
                      className={cn(
                        "w-[70px] text-xs text-right text-muted-foreground/70 text-nowrap",
                        dayjs(date, "YYYY-MM-DD").isBefore(dayjs().startOf("day")) &&
                        "text-destructive",
                      )}
                    >
                      {formatTaskDate(date)}
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
