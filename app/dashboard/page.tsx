"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { 
  Calendar, 
  Camera, 
  Mic, 
  Notebook, 
  Plus, 
  Search
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useIsMobile } from "@/hooks/use-mobile";
import dayjs from "@/lib/dayjs.config";

import CalendarScheduleView from "./components/calendar/calendar-schedule-view";
import DashboardBanner from "./components/dashboard-banner";
import Scratchpad from "./components/scratch-pad/scratch-pad";
import AddTaskDrawerDialog from "./components/tasks/add-task-drawer-dialog";
import TasksCard from "./components/tasks/tasks-card";
import Timer from "./components/timer/timer";

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const createNote = useMutation(api.notes.create);

  const handleCreateNote = async () => {
    try {
      const noteId = await createNote({ title: "Untitled Note" });
      router.push(`/dashboard/notes/${noteId}`);
      toast.success("Note created");
    } catch (error) {
      toast.error("Failed to create note");
      console.error(error);
    }
  };

  // Mobile Evernote-style layout
  if (isMobile) {
    return (
      <div className="h-full w-full bg-background px-2">
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className="flex items-center justify-center py-2 pb-4">
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-semibold text-foreground">My Dashboard</h1>
              <p className="text-sm text-muted-foreground">{dayjs().format("dddd, MMMM D, YYYY")}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className=" mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Find any note, task or document"
                className="w-full bg-muted/50 border-muted-foreground/20 rounded-lg pl-3 pr-10 h-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="flex my-4 gap-3">
            <Button 
              variant="default" 
              onClick={handleCreateNote}
              className="flex items-start justify-start flex-1 bg-green-500 hover:bg-green-600 border-green-500 rounded-lg h-20 w-full p-2"
            >
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span className="text-xs">New note</span>
            </div>
            </Button>
            <AddTaskDrawerDialog>
              <Button 
                variant="default" 
                className="flex items-start justify-start flex-1 bg-purple-500 hover:bg-purple-600 border-purple-500 rounded-lg h-20 w-full p-2"
              >
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span className="text-xs">New task</span>
              </div>
              </Button>
            </AddTaskDrawerDialog>
          </div>

          {/* Feature Buttons */}
          <div className=" mb-4 grid grid-cols-4 gap-2">
            <Button variant="outline" className="flex flex-col items-center justify-center h-20 bg-muted/50 border-muted-foreground/20 hover:bg-muted">
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">Event</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-20 bg-muted/50 border-muted-foreground/20 hover:bg-muted">
              <Notebook className="h-5 w-5 mb-1" />
              <span className="text-xs">Notebook</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-20 bg-muted/50 border-muted-foreground/20 hover:bg-muted">
              <Mic className="h-5 w-5 mb-1" />
              <span className="text-xs">Audio</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-20 bg-muted/50 border-muted-foreground/20 hover:bg-muted">
              <Camera className="h-5 w-5 mb-1" />
              <span className="text-xs">Camera</span>
            </Button>
          </div>

          {/* Scratch Pad Section */}
          <div className=" py-4 flex-1">
            <Scratchpad />
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (existing)
  return (
    <div className="h-full flex flex-col flex-1 overflow-y-auto overflow-x-hidden w-full">
      <DashboardBanner />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1 md:p-4 w-full">
        <div className="flex justify-center">
          <TasksCard />
        </div>
        <div className="flex justify-center">
          <Scratchpad />
        </div>
        <div className="flex justify-center">
          <Timer />
        </div>
        <div className="flex justify-center">
          <CalendarScheduleView />
        </div>
      </div>
    </div>
  );
}
