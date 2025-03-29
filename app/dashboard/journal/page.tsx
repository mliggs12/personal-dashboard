import { AddEntryForm } from "./components/add-entry-form";
import EntryList from "./components/entry-list";

export default function JournalPage() {
  return (
    <div className="px-2 md:px-4 pb-2 md:pb-4">
      <div className="journal-header"></div>
      <div className="journal-body space-y-6">
        <AddEntryForm />
        <EntryList />
      </div>
    </div>
  );
}
