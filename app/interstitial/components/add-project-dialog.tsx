import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import AddProjectForm from "./add-project-form";
import { useToast } from "@/hooks/use-toast";

export default function AddProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <Dialog
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button size="icon">
          <PlusCircleIcon className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
        </DialogHeader>
        <AddProjectForm
          onProjectCreated={() => {
            setIsOpen(false);
            toast({
              title: "Project created",
              description: new Date().toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              }),
            });
          }}
        />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
