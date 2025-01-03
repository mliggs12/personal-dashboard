import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TiptapEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
}

export default function TiptapEditor({
  initialContent,
  onChange,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Highlight, Typography],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[150px] rounded-md border-none bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
}
