export default function NotesPage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">
          Select a note to view
        </h1>
        <p className="text-muted-foreground">
          Choose a note from the sidebar to get started
        </p>
      </div>
    </div>
  );
}
