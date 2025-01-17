import React from "react";

import AddEntryForm from "./components/add-entry-form";

export default function JournalPage() {
  return (
    <div className="p-4">
      <div className="journal-header"></div>
      <div className="journal-body">
        <AddEntryForm />
      </div>
    </div>
  );
}
