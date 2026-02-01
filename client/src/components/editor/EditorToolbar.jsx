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
    </div>
  );
}

