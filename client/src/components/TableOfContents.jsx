import { useState, useEffect, useCallback } from "react";
import "./TableOfContents.css";

const SCROLL_OFFSET = 100;
const MIN_HEADINGS = 2;

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState("");
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!headings || headings.length < MIN_HEADINGS) return;
    function onScroll() {
      const scrollY = window.scrollY + SCROLL_OFFSET;
      let current = headings[0]?.id || "";
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.offsetTop <= scrollY) {
          current = h.id;
        }
      }
      setActiveId(current);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      setCollapsed(true);
    }
  }, []);

  if (!headings || headings.length < MIN_HEADINGS) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <button
        className="toc-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span className="toc-toggle-label">On this page</span>
        <svg
          className={`toc-chevron ${collapsed ? "" : "open"}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>
      <div className="toc-title">On this page</div>
      <ul className={`toc-list ${collapsed ? "collapsed" : ""}`}>
        {headings.map((h) => (
          <li key={h.id} className={`toc-item level-${h.level}`}>
            <button
              className={`toc-link ${activeId === h.id ? "active" : ""}`}
              onClick={() => scrollTo(h.id)}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
