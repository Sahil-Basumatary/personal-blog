import { useState, useRef, useEffect, useCallback } from "react";
import { sanitizeLinkHref } from "../../lib/markdown/urlPolicy";
import { uploadImage } from "../../api/uploads";
import "./EditorToolbar.css";

const ICONS = {
  undo: (
    <svg viewBox="0 0 64 64" fill="currentColor">
      <path d="m56.79 16.09c-13.45-18.41-42.4-12.38-47.79 9.37l-3.23-6.19a2 2 0 0 0-3.54 1.87l6.22 11.79a2 2 0 0 0 2.21 1 4.24 4.24 0 0 0 .5-.18l11.84-6.2a2 2 0 0 0-1.92-3.55l-8.6 4.54c3-19.93 29-26.54 41.08-10.09 11.11 14.82.09 36.59-18.45 36.43a22.73 22.73 0 0 1-13.54-4.44 2 2 0 1 0-2.37 3.22 26.62 26.62 0 0 0 15.91 5.22c21.78.19 34.73-25.38 21.68-42.79z" />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 64 64" fill="currentColor">
      <path d="M60.93,18.44a2,2,0,0,0-2.7.83L55,25.46C51.64,11,35.3,1.49,20.77,6.36A27,27,0,0,0,2,32C1.82,53.78,27.39,66.73,44.8,53.67a2,2,0,0,0-2.37-3.22A22.88,22.88,0,0,1,6,32,23,23,0,0,1,22,10.17c13.14-4.39,27.75,4.9,29.54,18.38L42.92,24a2,2,0,0,0-1.87,3.54l11.79,6.22a2,2,0,0,0,2.71-.84l6.22-11.79A2,2,0,0,0,60.93,18.44Z" />
    </svg>
  ),
  bold: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="m13 13h-6c-.6 0-1-.4-1-1v-7c0-.6.4-1 1-1h6c1.2 0 2.3.5 3.2 1.3.9.9 1.3 2 1.3 3.2s-.5 2.3-1.3 3.2c-.9.8-2 1.3-3.2 1.3zm-5-2h5c.7 0 1.3-.3 1.8-.7.5-.5.7-1.1.7-1.8s-.3-1.3-.7-1.8c-.5-.4-1.1-.7-1.8-.7h-5z" />
      <path d="m14 20h-7c-.6 0-1-.4-1-1v-7c0-.6.4-1 1-1s1 .4 1 1v6h6c.7 0 1.3-.3 1.8-.7s.7-1.1.7-1.8-.3-1.3-.7-1.8-1.1-.7-1.8-.7h-1c-.6 0-1-.4-1-1s.4-1 1-1h1c1.2 0 2.3.5 3.2 1.3s1.3 2 1.3 3.2-.5 2.3-1.3 3.2c-.9.8-2 1.3-3.2 1.3z" />
    </svg>
  ),
  italic: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="m13.557 5h-1.557c-.552 0-1-.448-1-1s.448-1 1-1h6c.552 0 1 .448 1 1s-.448 1-1 1h-2.307l-5.25 14h1.557c.552 0 1 .448 1 1s-.448 1-1 1h-6c-.552 0-1-.448-1-1s.448-1 1-1h2.307z" />
    </svg>
  ),
  strike: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round">
      <path d="m17 16.5v1a3.5 3.5 0 0 1-3.5 3.5h-2a3.5 3.5 0 0 1-3.5-3.5.5.5 0 0 1 1 0 2.5 2.5 0 0 0 2.5 2.5h2a2.5 2.5 0 0 0 2.5-2.5v-1a.5.5 0 0 1 1 0zm1.5-2.5h-1.847a3.5 3.5 0 0 0-3.153-2h-2a2.5 2.5 0 0 1-2.5-2.5v-2a2.5 2.5 0 0 1 2.5-2.5h2a2.5 2.5 0 0 1 2.5 2.5.5.5 0 0 0 1 0 3.5 3.5 0 0 0-3.5-3.5h-2a3.5 3.5 0 0 0-3.5 3.5v2a3.5 3.5 0 0 0 3.5 3.5h2a2.5 2.5 0 0 1 2 1h-9a.5.5 0 0 0 0 1h12a.5.5 0 0 0 0-1z" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="m1.293 12.707 4 4a1 1 0 1 0 1.414-1.414l-3.293-3.293 3.293-3.293a1 1 0 1 0-1.414-1.414l-4 4a1 1 0 0 0 0 1.414z" />
      <path d="m18.707 7.293a1 1 0 1 0-1.414 1.414l3.293 3.293-3.293 3.293a1 1 0 1 0 1.414 1.414l4-4a1 1 0 0 0 0-1.414z" />
      <path d="m13.039 4.726-4 14a1 1 0 0 0 .686 1.236 1.053 1.053 0 0 0 .275.038 1 1 0 0 0 .961-.726l4-14a1 1 0 1 0-1.922-.548z" />
    </svg>
  ),
  bulletList: (
    <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" clipRule="evenodd" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round">
      <path d="m4.0001 6.10001c-.49706 0-.9.40294-.9.9 0 .49705.40294.9.9.9h1c.49706 0 .9-.40295.9-.9 0-.49706-.40294-.9-.9-.9zm5 0c-.49706 0-.9.40294-.9.9 0 .49705.40294.9.9.9h11c.4971 0 .9-.40295.9-.9 0-.49706-.4029-.9-.9-.9zm0 4.99999c-.49706 0-.9.4029-.9.9s.40294.9.9.9h11c.4971 0 .9-.4029.9-.9 0-.497-.4029-.9-.9-.9zm-.9 5.9c0-.4971.40294-.9.9-.9h11c.4971 0 .9.403.9.9 0 .4971-.4029.9-.9.9h-11c-.49706 0-.9-.4029-.9-.9zm-5-5c0-.4971.40294-.9.9-.9h1c.49706 0 .9.403.9.9 0 .4971-.40294.9-.9.9h-1c-.49706 0-.9-.4029-.9-.9zm.9 4.1c-.49706 0-.9.4029-.9.9s.40294.9.9.9h1c.49706 0 .9-.4029.9-.9s-.40294-.9-.9-.9z" />
    </svg>
  ),
  orderedList: (
    <svg viewBox="0 0 32 32" fill="currentColor" stroke="currentColor" strokeWidth="0.4" strokeLinejoin="round">
      <path d="m29 8h-18a1 1 0 0 1 0-2h18a1 1 0 0 1 0 2z" />
      <path d="m29 17h-18a1 1 0 0 1 0-2h18a1 1 0 0 1 0 2z" />
      <path d="m29 26h-18a1 1 0 0 1 0-2h18a1 1 0 0 1 0 2z" />
      <path d="m5.93 8.54h1.07v1h-3.56v-1h1.16v-2.21a4.19 4.19 0 0 1-1 .34v-1a2 2 0 0 0 1.35-.77h1z" />
      <path d="m6.81 17.44-.05 1.15h-3.55v-1.08l.79-.51c.12-.08.33-.25.65-.51a3.65 3.65 0 0 0 .62-.61.78.78 0 0 0 .15-.44.5.5 0 0 0-.12-.44.44.44 0 0 0-.3-.1q-.51 0-.58.81l-1.18-.23a1.84 1.84 0 0 1 .64-1.23 1.92 1.92 0 0 1 1.22-.4 1.85 1.85 0 0 1 1.24.41 1.35 1.35 0 0 1 .48 1.08 1.56 1.56 0 0 1-.26.86 6 6 0 0 1-1.56 1.24z" />
      <path d="m3.09 26.16 1.21-.16q.12.64.68.64a.63.63 0 0 0 .42-.13.44.44 0 0 0 .16-.36.43.43 0 0 0-.09-.26.52.52 0 0 0-.19-.16.93.93 0 0 0-.34 0h-.56v-1h.48c.25 0 .42 0 .49-.14a.45.45 0 0 0 .11-.28.4.4 0 0 0-.14-.31.52.52 0 0 0-.32-.14.56.56 0 0 0-.58.53l-1.13-.18a1.66 1.66 0 0 1 .65-1 2 2 0 0 1 1.18-.36 2 2 0 0 1 1.23.36 1.15 1.15 0 0 1 .46 1 1 1 0 0 1-.2.63 1 1 0 0 1-.5.36 1.06 1.06 0 0 1 .84 1.1 1.21 1.21 0 0 1-.51 1 2.21 2.21 0 0 1-1.32.37 1.84 1.84 0 0 1-2.03-1.51z" />
    </svg>
  ),
  blockquote: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="m4.7 17.7c-1-1.1-1.6-2.3-1.6-4.3 0-3.5 2.5-6.6 6-8.2l.9 1.3c-3.3 1.8-4 4.1-4.2 5.6.5-.3 1.2-.4 1.9-.3 1.8.2 3.2 1.6 3.2 3.5 0 .9-.4 1.8-1 2.5-.7.7-1.5 1-2.5 1-1.1 0-2.1-.5-2.7-1.1zm10 0c-1-1.1-1.6-2.3-1.6-4.3 0-3.5 2.5-6.6 6-8.2l.9 1.3c-3.3 1.8-4 4.1-4.2 5.6.5-.3 1.2-.4 1.9-.3 1.8.2 3.2 1.6 3.2 3.5 0 .9-.4 1.8-1 2.5s-1.5 1-2.5 1c-1.1 0-2.1-.5-2.7-1.1z" />
    </svg>
  ),
  codeBlock: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round">
      <path d="m20 3.5h-16a2.50263 2.50263 0 0 0-2.5 2.5v12a2.50263 2.50263 0 0 0 2.5 2.5h16a2.50263 2.50263 0 0 0 2.5-2.5v-12a2.50263 2.50263 0 0 0-2.5-2.5zm1.5 14.5a1.50164 1.50164 0 0 1-1.5 1.5h-16a1.50164 1.50164 0 0 1-1.5-1.5v-12a1.50164 1.50164 0 0 1 1.5-1.5h16a1.50164 1.50164 0 0 1 1.5 1.5zm-11.14648-6.35352a.49983.49983 0 0 1 0 .707l-4 4a.5.5 0 0 1-.707-.707l3.64648-3.64648-3.64652-3.64648a.5.5 0 0 1 .707-.707zm8.14648 4.35352a.49971.49971 0 0 1-.5.5h-6a.5.5 0 0 1 0-1h6a.49971.49971 0 0 1 .5.5z" />
    </svg>
  ),
  hr: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="m0 11h24v2h-24z" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 64 64" fill="currentColor">
      <path d="m36.243 29.758c-.512 0-1.024-.195-1.414-.586-3.119-3.119-8.194-3.12-11.314 0-.78.781-2.048.781-2.828 0-.781-.781-.781-2.047 0-2.828 4.679-4.68 12.292-4.679 16.97 0 .781.781.781 2.047 0 2.828-.39.391-.903.586-1.414.586z" />
      <path d="m34.829 41.167c-3.073 0-6.146-1.17-8.485-3.509-.781-.781-.781-2.047 0-2.828.78-.781 2.048-.781 2.828 0 3.119 3.119 8.194 3.12 11.314 0 .78-.781 2.048-.781 2.828 0 .781.781.781 2.047 0 2.828-2.34 2.339-5.413 3.509-8.485 3.509z" />
      <path d="m41.899 38.243c-.512 0-1.024-.195-1.414-.586-.781-.781-.781-2.047 0-2.828l11.172-11.172c.78-.781 2.048-.781 2.828 0 .781.781.781 2.047 0 2.828l-11.172 11.172c-.39.391-.902.586-1.414.586z" />
      <path d="m25.071 55.071c-.512 0-1.024-.195-1.414-.586-.781-.781-.781-2.047 0-2.828l6.245-6.245c.78-.781 2.048-.781 2.828 0 .781.781.781 2.047 0 2.828l-6.245 6.245c-.39.391-.902.586-1.414.586z" />
      <path d="m10.929 40.929c-.512 0-1.024-.195-1.414-.586-.781-.781-.781-2.047 0-2.828l11.172-11.171c.781-.781 2.048-.781 2.828 0 .781.781.781 2.047 0 2.828l-11.172 11.171c-.391.39-.903.586-1.414.586z" />
      <path d="m32.684 19.175c-.512 0-1.023-.195-1.414-.585-.781-.781-.781-2.047 0-2.829l6.245-6.246c.781-.781 2.047-.781 2.829 0 .781.781.781 2.047 0 2.829l-6.245 6.246c-.391.389-.904.585-1.415.585z" />
      <path d="m18 57.935c-3.093 0-6.186-1.15-8.485-3.45-4.6-4.6-4.6-12.371 0-16.971.78-.781 2.048-.781 2.828 0 .781.781.781 2.047 0 2.828-3.066 3.066-3.066 8.248 0 11.314s8.248 3.066 11.314 0c.78-.781 2.048-.781 2.828 0 .781.781.781 2.047 0 2.828-2.299 2.301-5.392 3.451-8.485 3.451z" />
      <path d="m53.071 27.071c-.512 0-1.024-.195-1.414-.586-.781-.781-.781-2.047 0-2.828 3.066-3.066 3.066-8.248 0-11.314s-8.248-3.066-11.314 0c-.78.781-2.048.781-2.828 0-.781-.781-.781-2.047 0-2.828 4.6-4.6 12.371-4.6 16.971 0s4.6 12.371 0 16.971c-.391.39-.903.585-1.415.585z" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="m15 22.75h-6c-5.43 0-7.75-2.32-7.75-7.75v-6c0-5.43 2.32-7.75 7.75-7.75h6c5.43 0 7.75 2.32 7.75 7.75v6c0 5.43-2.32 7.75-7.75 7.75zm-6-20c-4.61 0-6.25 1.64-6.25 6.25v6c0 4.61 1.64 6.25 6.25 6.25h6c4.61 0 6.25-1.64 6.25-6.25v-6c0-4.61-1.64-6.25-6.25-6.25z" />
      <path d="m9 10.75c-1.52 0-2.75-1.23-2.75-2.75s1.23-2.75 2.75-2.75 2.75 1.23 2.75 2.75-1.23 2.75-2.75 2.75zm0-4c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25z" />
      <path d="m2.66977 19.7001c-.24 0-.48-.12-.62-.33-.23-.34-.14-.81.21-1.04l4.93-3.31c1.08-.73 2.57-.64 3.55003.19l.33.29c.5.43 1.35.43 1.84 0l4.16-3.57c1.06-.91 2.73-.91 3.8 0l1.63 1.4c.31.27.35.74.08 1.06-.27.31-.74.35-1.06.08l-1.63-1.4c-.5-.43-1.35-.43-1.85 0l-4.16 3.57c-1.06.91-2.73.91-3.8 0l-.33003-.29c-.46-.39-1.22-.43-1.73-.08l-4.93 3.31c-.13.08-.28.12-.42.12z" />
    </svg>
  ),
};

function ToolbarButton({ icon, label, shortcut, active, disabled, onClick }) {
  const title = shortcut ? `${label} (${shortcut})` : label;
  return (
    <button
      type="button"
      className={`toolbar-btn ${active ? "active" : ""}`}
      aria-label={label}
      aria-pressed={active}
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

function LinkDialog({ isOpen, initialUrl, onClose, onApply, onRemove }) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setError("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, initialUrl]);
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  function handleClickOutside(e) {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose();
    }
  }
  function handleApply() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("URL is required");
      return;
    }
    const sanitized = sanitizeLinkHref(trimmed);
    if (!sanitized) {
      setError("Invalid or unsafe URL");
      return;
    }
    onApply(sanitized);
  }
  if (!isOpen) return null;
  return (
    <div className="link-dialog-overlay" onClick={handleClickOutside}>
      <div className="link-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="link-dialog-title">
        <h3 id="link-dialog-title" className="link-dialog-title">Insert Link</h3>
        <input
          ref={inputRef}
          type="url"
          className="link-dialog-input"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
        />
        {error && <p className="link-dialog-error">{error}</p>}
        <div className="link-dialog-actions">
          {initialUrl && (
            <button type="button" className="link-dialog-btn remove" onClick={onRemove}>
              Remove
            </button>
          )}
          <button type="button" className="link-dialog-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="link-dialog-btn apply" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditorToolbar({ editor, disabled = false, getToken, onUploadError }) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDialogUrl, setLinkDialogUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const isDisabled = disabled || !editor;
  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;
  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const existingHref = editor.getAttributes("link").href || "";
    setLinkDialogUrl(existingHref);
    setLinkDialogOpen(true);
  }, [editor]);
  const closeLinkDialog = useCallback(() => {
    setLinkDialogOpen(false);
    setLinkDialogUrl("");
  }, []);
  const applyLink = useCallback((href) => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    closeLinkDialog();
  }, [editor, closeLinkDialog]);
  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    closeLinkDialog();
  }, [editor, closeLinkDialog]);
  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    e.target.value = "";
    if (!getToken) {
      onUploadError?.(new Error("Authentication not available"));
      return;
    }
    setUploading(true);
    try {
      const token = await getToken();
      const result = await uploadImage(file, token);
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch (err) {
      onUploadError?.(err);
    } finally {
      setUploading(false);
    }
  }, [editor, getToken, onUploadError]);
  return (
    <>
    <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
      <div className="toolbar-group">
        <ToolbarButton
          icon={ICONS.undo}
          label="Undo"
          shortcut="Ctrl+Z"
          disabled={isDisabled || !canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={ICONS.redo}
          label="Redo"
          shortcut="Ctrl+Shift+Z"
          disabled={isDisabled || !canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        />
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <ToolbarButton
          icon={ICONS.bold}
          label="Bold"
          shortcut="Ctrl+B"
          active={editor?.isActive("bold")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={ICONS.italic}
          label="Italic"
          shortcut="Ctrl+I"
          active={editor?.isActive("italic")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={ICONS.strike}
          label="Strikethrough"
          shortcut="Ctrl+Shift+S"
          active={editor?.isActive("strike")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon={ICONS.code}
          label="Inline Code"
          shortcut="Ctrl+`"
          active={editor?.isActive("code")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        />
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <ToolbarButton
          icon={ICONS.bulletList}
          label="Bullet List"
          active={editor?.isActive("bulletList")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ICONS.orderedList}
          label="Numbered List"
          active={editor?.isActive("orderedList")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={ICONS.blockquote}
          label="Blockquote"
          active={editor?.isActive("blockquote")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={ICONS.codeBlock}
          label="Code Block"
          active={editor?.isActive("codeBlock")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          icon={ICONS.hr}
          label="Horizontal Rule"
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        />
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <ToolbarButton
          icon={ICONS.link}
          label="Insert Link"
          active={editor?.isActive("link")}
          disabled={isDisabled}
          onClick={openLinkDialog}
        />
        <ToolbarButton
          icon={ICONS.image}
          label={uploading ? "Uploading..." : "Insert Image"}
          disabled={isDisabled || uploading}
          onClick={handleImageClick}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="toolbar-file-input"
          onChange={handleFileChange}
        />
      </div>
    </div>
    <LinkDialog
      isOpen={linkDialogOpen}
      initialUrl={linkDialogUrl}
      onClose={closeLinkDialog}
      onApply={applyLink}
      onRemove={removeLink}
    />
    </>
  );
}

