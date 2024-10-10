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
              <div className="flex flex-col items-start">
                <button
                  className={clsx(
                    "text-sm font-normal text-left",
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
                        {moment(dueAt).format("LL")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogTrigger>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
