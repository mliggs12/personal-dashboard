import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function NoteTitle({
  id,
  initialContent,
}: {
  id: string;
  initialContent: string;
}) {
  const updateNote = useMutation(api.notes.update);

  const handleChange = (title: string) => {
    updateNote({ noteId: id as Id<"notes">, title });
  };

  const editor = useEditor({
    extensions: [StarterKit],
    autofocus: "end",
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-2xl font-bold border-none bg-background ring-offset-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none pb-2",
      },
    },
    onUpdate: ({ editor }) => {
      handleChange(editor.getText());
    },
  });
  return <EditorContent editor={editor} />;
}
