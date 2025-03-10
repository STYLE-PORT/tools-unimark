import { useCallback } from "react";

export const useClipboard = (elementRef: React.RefObject<HTMLElement>) => {
  const copyToClipboard = useCallback(
    (onCopySuccess: () => void) => {
      if (!elementRef.current) return;

      const range = document.createRange();
      range.selectNodeContents(elementRef.current);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      try {
        document.execCommand("copy");
        onCopySuccess();
      } catch (err) {
        console.error(err);
      }

      selection?.removeAllRanges();
    },
    [elementRef],
  );

  return { copyToClipboard };
};
