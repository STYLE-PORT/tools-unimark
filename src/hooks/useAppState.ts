import { useCallback, useState } from "react";

export const useAppState = () => {
  const [text, setText] = useState<string>(localStorage.getItem("text") || "");
  const [html, setHtml] = useState<string>("");
  const [showCopyStatus, setShowCopyStatus] = useState<boolean>(false);
  const [isBold, setIsBold] = useState<boolean>(true);

  const updateText = useCallback((value: string) => {
    setText(value);
    localStorage.setItem("text", value);
  }, []);

  const showCopyStatusWithTimeout = useCallback(() => {
    setShowCopyStatus(true);
    setTimeout(() => {
      setShowCopyStatus(false);
    }, 2000);
  }, []);

  const toggleBold = useCallback(() => {
    setIsBold((prev) => !prev);
  }, []);

  return {
    text,
    html,
    showCopyStatus,
    isBold,
    updateText,
    setHtml,
    showCopyStatusWithTimeout,
    toggleBold,
  } as const;
};