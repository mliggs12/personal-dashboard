import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Doc } from "@/convex/_generated/dataModel";
import clsx from "clsx";
import moment from "moment-timezone";

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
                {due && (
                  <div className="flex items-center justify-center gap-1">
                    <p
                      className={clsx(
                        "text-sm",
                        moment(due)
                          .tz("America/Denver")
                          .isBefore(moment().tz("America/Denver"), "day") &&
                          "text-destructive",
                      )}
                    >
                      {moment(due).tz("America/Denver").calendar(null, {
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
