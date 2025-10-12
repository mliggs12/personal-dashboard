import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Document from '@tiptap/extension-document';
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { cn } from "@/lib/utils";

import "@/app/styles.scss";

interface TiptapEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  className?: string;
}

const CustomTaskItem = TaskItem.extend({
  content: 'inline*',
})

export default function TiptapEditor({
  initialContent,
  onChange,
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      Code,
      CodeBlock,
      Document,
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
      CustomTaskItem.configure({
        nested: true,
      }),
    ],
    autofocus: "end",
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          cn(
            "prose dark:prose-invert prose-sm prose-p:my-[2px] max-w-none min-h-[150px] rounded-md border-none bg-background ring-offset-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
            className,
          )
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
}
