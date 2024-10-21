import NotesTable from "./components/notes-table";

export default function NotesPage() {
  return (
    <div className="flex flex-col p-8 text-2xl w-1/2">
      <h1 className="text-3xl font-semibold mb-4">Notes</h1>
      <NotesTable />
    </div>
  );
}
