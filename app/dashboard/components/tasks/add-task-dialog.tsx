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

export default function AddTaskDialog({ data }: { data: Doc<"tasks"> }) {
  const { name, updated, notes, status, priority, due, _id } = data;

  const remove = useMutation(api.tasks.remove);

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
        {taskDetails.map(({ labelName, value, icon }, idx) => (
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
        ))}
        <div className="flex gap-2 p-4 w-full justify-end">
          <form onSubmit={(e) => handleDeleteTask(e)}>
            <button type="submit">
              <Trash2 className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </DialogContent>
  );
}
