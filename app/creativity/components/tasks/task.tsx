import { Doc } from "@/convex/_generated/dataModel";
import clsx from "clsx";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, GitBranch, Tag } from "lucide-react";
import moment from "moment";

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
  const { name, dueAt } = data;

  return (
    <div
      key={data._id}
      className="flex items-center space-x-2 p-2 border-gray-100 animate-in fade-in"
    >
      <Dialog>
        <div className="flex gap-2 items-center justify-end w-full">
          <div className="flex gap-2 w-full">
            <Checkbox
              id="task"
              className={clsx(
                "w-5 h-5 rounded-xl",
                isCompleted &&
                  "data-[state=checked]:bg-gray-300 border-gray-300",
              )}
              checked={isCompleted}
              onCheckedChange={handleOnChange}
            />
            <DialogTrigger asChild>
              <button
                className={clsx(
                  "flex items-center justify-between w-full",
                  isCompleted && "text-foreground/30",
                )}
              >
                <span
                  className={clsx(
                    "text-sm font-normal text-left",
                    isCompleted && "line-through",
                  )}
                >
                  {name}
                </span>
                {dueAt && (
                  <div className="flex items-center justify-center gap-1">
                    <p
                      className={clsx(
                        "text-sm",
                        moment(dueAt).isBefore(moment(), "day") &&
                          "text-destructive",
                      )}
                    >
                      {moment(dueAt).calendar(null, {
                        sameDay: "[Today]",
                        nextDay: "[Tomorrow]",
                        nextWeek: "ddd, MMM DD",
                        lastDay: "[Yesterday]",
                        lastWeek: "ddd, MMM DD",
                        sameElse: "MM/DD",
                      })}
                    </p>
                  </div>
                )}
              </button>
            </DialogTrigger>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
