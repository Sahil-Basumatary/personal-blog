import "./EditorToolbar.css";

const ICONS = {
  undo: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 8h9a4 4 0 1 1 0 8H9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5L4 8l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 8H7a4 4 0 1 0 0 8h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 5l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bold: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 4h5.5a3.5 3.5 0 0 1 2.45 6A3.5 3.5 0 0 1 11 16H5V4zm3 5h2a1.5 1.5 0 0 0 0-3H8v3zm0 3v3h2.5a1.5 1.5 0 0 0 0-3H8z" />
    </svg>
  ),
  italic: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 4h6M6 16h6M11 4l-2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  strike: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 4h6a3 3 0 0 1 0 6H7v6h6a3 3 0 0 0 0-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 6L3 10l4 4M13 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  h1: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4v12M3 10h6M9 4v12M13 16v-8l-2 1.5M15 16h-4" />
    </svg>
  ),
  h2: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 4v12M2 10h5M7 4v12M12 8a2 2 0 1 1 4 2c0 1.5-4 3-4 5h5M12 16h5" />
    </svg>
  ),
  h3: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 4v12M2 10h5M7 4v12M13 7a2 2 0 1 1 3 1.5M13 13a2 2 0 1 0 3-1.5M16 10h-3" />
    </svg>
  ),
  bulletList: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <circle cx="4" cy="5" r="1.5" />
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="4" cy="15" r="1.5" />
      <path d="M8 5h9M8 10h9M8 15h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  orderedList: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <text x="2" y="7" fontSize="5" fontWeight="600">1</text>
      <text x="2" y="12" fontSize="5" fontWeight="600">2</text>
      <text x="2" y="17" fontSize="5" fontWeight="600">3</text>
      <path d="M8 5h9M8 10h9M8 15h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  blockquote: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 5c3 0 4 2 4 5s-1 5-4 5M4 5v5M12 5c3 0 4 2 4 5s-1 5-4 5M12 5v5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  codeBlock: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M7 8l-2 2 2 2M13 8l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  hr: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10h14" strokeLinecap="round" />
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

export default function EditorToolbar({ editor, disabled = false }) {
  const isDisabled = disabled || !editor;
  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;
  return (
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
          icon={ICONS.h1}
          label="Heading 1"
          active={editor?.isActive("heading", { level: 1 })}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          icon={ICONS.h2}
          label="Heading 2"
          active={editor?.isActive("heading", { level: 2 })}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          icon={ICONS.h3}
          label="Heading 3"
          active={editor?.isActive("heading", { level: 3 })}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
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
    </div>
  );
}

