import "@/app/styles.scss";

import Document from '@tiptap/extension-document';
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { forwardRef, useCallback, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

interface ScratchPadEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  className?: string;
}

export interface ScratchPadEditorRef {
  clear: () => void;
}

const ScratchPadEditor = forwardRef<ScratchPadEditorRef, ScratchPadEditorProps>(
  ({ initialContent, onChange, className }, ref) => {
    const editor = useEditor({
      extensions: [
        Document,
        Link.configure({
          defaultProtocol: "https",
          HTMLAttributes: {
            class: "no-underline hover:cursor-pointer hover:text-primary hover:underline hover:underline-offset-4",
          },
        }),
        StarterKit,
      ],
      autofocus: "end",
      content: initialContent,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: cn(
            "prose dark:prose-invert prose-sm prose-p:my-[2px] max-w-none min-h-[150px] rounded-md border-none bg-background ring-offset-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
            className,
          )
        },
      },
    });

    const clearContent = useCallback(() => {
      editor?.chain().focus().clearContent(true).run();
    }, [editor]);

    useImperativeHandle(ref, () => ({
      clear: clearContent
    }), [clearContent]);

    if (!editor) {
      return null;
    }

    return <EditorContent editor={editor} />;
  }
);

ScratchPadEditor.displayName = "ScratchPadEditor";

export default ScratchPadEditor;
