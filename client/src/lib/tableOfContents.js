export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

function uniqueSlug(text, counter) {
  const base = slugify(text);
  if (!base) return null;
  const count = counter.get(base) || 0;
  counter.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

export function parseHeadings(markdown) {
  if (!markdown || typeof markdown !== "string") return [];
  const stripped = markdown.replace(/```[\s\S]*?```/g, "");
  const regex = /^(#{2,3})\s+(.+)$/gm;
  const slugCounter = new Map();
  const headings = [];
  let match;
  while ((match = regex.exec(stripped)) !== null) {
    const level = match[1].length;
    const text = stripInlineMarkdown(match[2]);
    const id = uniqueSlug(text, slugCounter);
    if (!id) continue;
    headings.push({ id, text, level });
  }
  return headings;
}
