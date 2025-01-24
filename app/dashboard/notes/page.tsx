import NotesTable from "./components/notes-table";

export default function NotesPage() {
  return (
    <div className="flex flex-col h-full md:px-4">
      <h1 className="hidden md:block font-semibold text-2xl">Notes</h1>
      <NotesTable />
    </div>
  );
}
