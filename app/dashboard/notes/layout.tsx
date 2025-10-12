import NotesTable from "./components/notes-table";

interface NotesLayoutProps {
  children: React.ReactNode;
  note: React.ReactNode;
}

export default function NotesLayout({
  children,
  note,
}: NotesLayoutProps) {
  return (
    <div className="flex h-full px-4">

      {/* Sidebar Panel */}
      <div className="flex flex-col border-r">
        <h1 className="hidden md:block font-semibold text-2xl">Notes</h1>
        <NotesTable />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto">
        {children}
        {note}
      </div>

    </div>
  );
}
