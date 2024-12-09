import { cn } from "@/lib/utils";
import NotesTable from "./components/notes-table";

export default function NotesPage() {
  return (
    <div
      className={cn("flex flex-col h-full w-svh md:w-full gap-2 p-1 md:p-0")}
    >
      <h1 className="text-lg font-semibold md:text-2xl">Notes</h1>
      <NotesTable />
    </div>
  );
}
