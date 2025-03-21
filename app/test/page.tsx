"use client";

import "./styles.scss";

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

const CustomTaskItem = TaskItem.extend({
  content: 'inline*',
})

export default function TestPage() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      TaskList,
      CustomTaskItem,
    ],
    content: `
      <p>Shopping list</p>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">flour</li>
        <li data-type="taskItem" data-checked="true">baking powder</li>
        <li data-type="taskItem" data-checked="true">salt</li>
        <li data-type="taskItem" data-checked="false">sugar</li>
        <li data-type="taskItem" data-checked="false">milk</li>
        <li data-type="taskItem" data-checked="false">eggs</li>
        <li data-type="taskItem" data-checked="false">butter</li>
      </ul>
    `,
  })

  if (!editor) {
    return null
  }

  return (
    <div className="container flex flex-col gap-4">
      <EditorContent editor={editor} />
      <div>
        <div>HTML</div>
        {editor.getHTML()}
      </div>
      <div>
        <div>JSON</div>
        <pre>{JSON.stringify(editor.getJSON(), null, 2)}</pre>
      </div>
      <div>
        <div>Text</div>
        {editor.getText()}
      </div>
    </div>
  )
}
