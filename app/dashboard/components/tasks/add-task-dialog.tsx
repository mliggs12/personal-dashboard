import { useEffect, useState } from "react";

import { useMutation } from "convex/react";
import dayjs from "dayjs";
import { Calendar, Flag, Trash2 } from "lucide-react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

import TaskNotes from "./task-notes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { priorities, statuses } from "@/app/tasks/data/data";

export default function AddTaskDialog({ data }: { data: Doc<"tasks"> }) {
  const { name, updated, notes, status, priority, due, _id } = data;

  const remove = useMutation(api.tasks.remove);
  const updateStatus = useMutation(api.tasks.updateStatus);

  const { toast } = useToast();

  const [taskDetails, setTaskDetails] = useState<
    Array<{ labelName: string; value: string; icon: React.ReactNode }>
  >([]);

  useEffect(() => {
    const data = [
      {
        labelName: "Due date",
        value: dayjs(due || "").format("ddd MMM D"),
        icon: <Calendar className="w-4 h-4 text-primary capitalize" />,
      },
      {
        labelName: "Status",
        value: status?.toString() || "",
        icon: <Flag className="w-4 h-4 text-primary capitalize" />,
      },
      {
        labelName: "Priority",
        value: priority?.toString() || "",
        icon: <Flag className="w-4 h-4 text-primary capitalize" />,
      },
    ];
    if (data) {
      setTaskDetails(data);
    }
  }, [due, status, priority]);

  const handleDeleteTask = (e: any) => {
    e.preventDefault();
    const deletedId = remove({ taskId: _id });
    if (deletedId !== undefined) {
      toast({
        title: "🗑️ Successfully deleted",
        duration: 3000,
      });
    }
  };

  const handleStatusChange = (status: string) => {
    updateStatus({
      taskId: _id,
      status: status as
        | "backlog"
        | "todo"
        | "in_progress"
        | "done"
        | "cancelled"
        | "archived",
    });
  };

  return (
    <DialogContent className="max-w-4xl h-4/6 flex flex-col md:flex-row lg:justify-between text-right">
      <DialogHeader className="w-full">
        <DialogTitle className="text-xl">{name}</DialogTitle>
        <DialogDescription className="flex flex-col gap-4">
          <div className="flex gap-2">
            <p>Updated: {dayjs(updated).format("ddd MMM D [at] h:mm A")}</p>
          </div>
          <TaskNotes task={data} />
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2 w-1/2">
        {taskDetails.map(({ labelName, value, icon }, idx) =>
          labelName === "Status" ? (
            <div
              key={`${value}-${idx}`}
              className="grid gap-2 p-4 border-b-2"
            >
              <Label className="flex items-start">{labelName}</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 mr-auto p-0 justify-start data-[state=open]:bg-accent text-lg font-normal"
                  >
                    {icon}
                    <span>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {statuses.map((status) => (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                    >
                      {status.icon && (
                        <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{status.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div
              key={`${value}-${idx}`}
              className="grid gap-2 p-4 border-b-2 w-full"
            >
              <Label className="flex items-start">{labelName}</Label>
              <div className="flex text-left items-center justify-start gap-2 pb-2">
                {icon}
                <p>{value.charAt(0).toUpperCase() + value.slice(1)}</p>
              </div>
            </div>
          ),
        )}
        <div className="flex gap-2 p-4 w-full justify-end">
          <form onSubmit={(e) => handleDeleteTask(e)}>
            <Button
              size="icon"
              variant="ghost"
              type="submit"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
            </Button>
          </form>
        </div>
      </div>
    </DialogContent>
  );
}
