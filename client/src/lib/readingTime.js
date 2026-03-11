const WORDS_PER_MINUTE = 238;

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/[*_~>|`#\-]/g, "")
    .replace(/\n{2,}/g, " ")
    .trim();
}

export function estimateReadingTime(content) {
  if (!content || typeof content !== "string") return "1 MIN READ";
  const plain = stripMarkdown(content);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  return `${minutes} MIN READ`;
}
