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

import DashboardBanner from "./components/dashboard-banner";
import Scratchpad from "./components/scratch-pad/scratch-pad";
import AddTaskDrawerDialog from "./components/tasks/add-task-drawer-dialog";
import TasksCard from "./components/tasks/tasks-card";
import { useScratchpadPinned } from "@/hooks/use-scratchpad-pinned";

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const createNote = useMutation(api.notes.create);
  const { isPinned } = useScratchpadPinned();

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
      <div className="h-full w-full bg-background px-2 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className="flex items-center justify-center py-1 pb-2 shrink-0">
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-semibold text-foreground">My Dashboard</h1>
              <p className="text-xs text-muted-foreground">{dayjs().format("dddd, MMMM D, YYYY")}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-2 shrink-0">
            <div className="relative">
              <Input
                type="text"
                placeholder="Find any note, task or document"
                className="w-full bg-muted/50 border-muted-foreground/20 rounded-lg pl-3 pr-10 h-9"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="flex mb-2 gap-2 shrink-0">
            <Button 
              variant="default" 
              onClick={handleCreateNote}
              className="flex items-start justify-start flex-1 bg-green-500 hover:bg-green-600 border-green-500 rounded-lg h-16 w-full p-2"
            >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-xs">New note</span>
            </div>
            </Button>
            <AddTaskDrawerDialog>
              <Button 
                variant="default" 
                className="flex items-start justify-start flex-1 bg-purple-500 hover:bg-purple-600 border-purple-500 rounded-lg h-16 w-full p-2"
              >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-xs">New task</span>
              </div>
              </Button>
            </AddTaskDrawerDialog>
          </div>

          {/* Feature Buttons */}
          <div className="mb-2 grid grid-cols-4 gap-2 shrink-0">
            <Button variant="outline" className="flex flex-col items-center justify-center h-16 bg-muted/50 border-muted-foreground/20 hover:bg-muted">
              <Calendar className="h-4 w-4 mb-1" />
              <span className="text-xs">Event</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-16 bg-muted/50 border-muted-foreground/20 hover:bg-muted">
              <Notebook className="h-4 w-4 mb-1" />
              <span className="text-xs">Notebook</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-16 bg-muted/50 border-muted-foreground/20 hover:bg-muted">
              <Mic className="h-4 w-4 mb-1" />
              <span className="text-xs">Audio</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-16 bg-muted/50 border-muted-foreground/20 hover:bg-muted">
              <Camera className="h-4 w-4 mb-1" />
              <span className="text-xs">Camera</span>
            </Button>
          </div>

          {/* Tasks Card Section */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <TasksCard />
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-full flex flex-col flex-1 overflow-y-auto overflow-x-hidden w-full">
      <DashboardBanner />
      <div className="flex flex-col items-start px-8 py-6 w-full gap-12">
          <TasksCard />
        {isPinned && (
          <Scratchpad />
        )}
      </div>
    </div>
  );
}
