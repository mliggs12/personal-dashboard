import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TiptapEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
}

export default function NoteContent({
  initialContent,
  onChange,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      Code,
      CodeBlock,
      Link.configure({
        defaultProtocol: "https",
        HTMLAttributes: {
          class:
            "no-underline hover:cursor-pointer hover:text-primary hover:underline hover:underline-offset-4",
        },
      }),
      StarterKit,
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    autofocus: "end",
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
