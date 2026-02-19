import { useEffect } from "react";

export default function useUnsavedChanges(dirty) {
  useEffect(() => {
    if (!dirty) return;
    function handleBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);
}
