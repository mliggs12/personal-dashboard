import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function EditProjectDialog({
  project,
}: {
  project: Doc<"projects">;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(project?.name);
  const [color, setColor] = useState(project?.color);
  const updateProject = useMutation(api.projects.update);

  const handleSubmit = async () => {
    // Update project if name or color has changed
    if (name !== project?.name || color !== project?.color) {
      await updateProject({ id: project._id, name, color });
      setIsOpen(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          onClick={() => setIsOpen(true)}
          disabled={!project}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project: {project?.name}</DialogTitle>
        </DialogHeader>
        <Label
          htmlFor="name"
          className=""
        >
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className=""
        />
        <Label
          htmlFor="color"
          className=""
        >
          Color
        </Label>
        <Select
          defaultValue={project?.color}
          value={color}
          onValueChange={(value) =>
            setColor(
              value as
                | "red"
                | "blue"
                | "green"
                | "yellow"
                | "pink"
                | "purple"
                | "orange",
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a color"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="red">Red</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="yellow">Yellow</SelectItem>
            <SelectItem value="purple">Purple</SelectItem>
            <SelectItem value="pink">Pink</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
          >
            Update Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
