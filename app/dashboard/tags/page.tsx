"use client";

import { TagsContent } from "./tags-content";

export default function TagsPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Manage Tags</h1>
      <TagsContent />
    </div>
  );
}
