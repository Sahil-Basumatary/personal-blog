import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { useEffect, useRef } from "react";
import { markdownToHtml, htmlToMarkdown } from "../../lib/editor/markdownConverter";
import EditorToolbar from "./EditorToolbar";
import "./RichTextEditor.css";

export default function RichTextEditor({
  initialMarkdown = "",
  onChange,
  getToken,
  onUploadError,
  placeholder = "Start writing...",
  disabled = false,
}) {
  const isInitialMount = useRef(true);
  const lastEmittedMarkdown = useRef(initialMarkdown);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: markdownToHtml(initialMarkdown),
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const markdown = htmlToMarkdown(html);
      if (markdown !== lastEmittedMarkdown.current) {
        lastEmittedMarkdown.current = markdown;
        onChange?.(markdown);
      }
    },
  });
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);
  useEffect(() => {
    if (!editor || isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const currentMarkdown = htmlToMarkdown(editor.getHTML());
    if (initialMarkdown !== currentMarkdown) {
      editor.commands.setContent(markdownToHtml(initialMarkdown));
      lastEmittedMarkdown.current = initialMarkdown;
    }
  }, [initialMarkdown, editor]);
  return (
    <div className={`rich-text-editor ${disabled ? "disabled" : ""}`}>
      <EditorToolbar
        editor={editor}
        disabled={disabled}
        getToken={getToken}
        onUploadError={onUploadError}
      />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

