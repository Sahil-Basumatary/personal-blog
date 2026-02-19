import { useEffect, useRef, useCallback, useState } from "react";

const DEBOUNCE_MS = 1500;

export default function useAutoSave(storageKey, data, { enabled = true } = {}) {
  const [draftData, setDraftData] = useState(() => {
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const timerRef = useRef(null);
  const latestData = useRef(data);
  latestData.current = data;
  useEffect(() => {
    if (!enabled || !storageKey) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const payload = { ...latestData.current, _savedAt: Date.now() };
      try {
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {
        // storage full or unavailable -- fail silently
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [storageKey, enabled, data]);
  const clearDraft = useCallback(() => {
    if (!storageKey) return;
    localStorage.removeItem(storageKey);
    setDraftData(null);
  }, [storageKey]);
  return { draftData, clearDraft };
}
