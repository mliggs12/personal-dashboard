import { AddEntryForm } from "./components/add-entry-form";
import EntryList from "./components/entry-list";

export default function JournalPage() {
  return (
    <div className="p-4">
      <div className="journal-header"></div>
      <div className="journal-body space-y-8">
        <AddEntryForm />
        <EntryList />
      </div>
    </div>
  );
}
