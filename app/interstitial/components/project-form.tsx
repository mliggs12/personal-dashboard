"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doc, Id } from "@/convex/_generated/dataModel";
import EditProjectDialog from "./edit-project-dialog";
import AddProjectDialog from "./add-project-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { formatDuration } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const formSchema = z.object({
  projectId: z.string({
    required_error: "Project selection is required",
  }),
});

export default function ProjectForm({
  projects,
}: {
  projects: Doc<"projects">[];
}) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [selectedSessionId, setSelectedSessionId] =
    useState<Id<"sessions"> | null>(null);
  const [selectedProjectId, setSelectedProjectId] =
    useState<Id<"projects"> | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [pauseDuration, setPauseDuration] = useState(0);
  const [notes, setNotes] = useState("");

  const saveSession = useMutation(api.sessions.create);
  const discardSession = useMutation(api.sessions.remove);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (selectedProjectId) {
      setIsTimerRunning(true);
      setStartTime(new Date());
      toast({
        title: "Timer started",
        description: `Project: ${projects.find((p) => p._id === selectedProjectId)?.name}`,
      });
    }
  }

  async function handlePause() {
    setIsTimerRunning(false);
    setPauseDuration(duration);
  }

  async function handleResume() {
    setIsTimerRunning(true);
    setStartTime(new Date());
  }

  async function handleSave() {
    await saveSession({
      projectId: selectedProjectId as Id<"projects">,
      duration,
      pauseDuration,
      notes,
    });
    setIsTimerRunning(false);
    setStartTime(null);
    setDuration(0);
    setNotes("");
    toast({
      title: "Session saved",
      description: "Your session has been saved successfully.",
    });
  }

  async function handleDiscard() {
    await discardSession({
      sessionId: selectedSessionId as Id<"sessions">,
    });
    setIsTimerRunning(false);
    setStartTime(null);
    setDuration(0);
    setNotes("");
    toast({
      title: "Session discarded",
      description: "Your session has been discarded.",
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="flex gap-4 items-center">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem className="min-w-32">
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedProjectId(value as Id<"projects">);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem
                        key={project._id}
                        value={project._id}
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <EditProjectDialog
              project={
                projects.find((project) => project._id === selectedProjectId)!
              }
            />
            <AddProjectDialog />
          </div>
        </div>
        {!isTimerRunning && <Button type="submit">Start Timer</Button>}
        {isTimerRunning && (
          <div className="mt-4 p-4 border rounded-md">
            <p>Start Time: {startTime?.toLocaleTimeString()}</p>
            <p>Duration: {formatDuration(duration)}</p>
            <textarea
              className="w-full mt-2 p-2 border rounded-md"
              placeholder="Add notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <Button onClick={handleSave}>Save</Button>
              <Button
                onClick={handlePause}
                variant="outline"
              >
                {isTimerRunning ? "Pause" : "Resume"}
              </Button>
              <Button
                onClick={handleDiscard}
                variant="destructive"
              >
                Discard
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
