import DOMPurify from "dompurify";
import { marked } from "marked";
import type { Renderer } from "marked";
import { useCallback, useMemo } from "react";

marked.use({
  breaks: true,
  gfm: true,
});

export const useMarkdown = (isBold: boolean) => {
  const createRenderer = useCallback((bold: boolean): Renderer => {
    const r = new marked.Renderer();
    r.heading = ({ text, depth }) => {
      return bold ? `<h${depth}><strong>${text}</strong></h${depth}>` : `<h${depth}>${text}</h${depth}>`;
    };
    return r;
  }, []);

  const renderer = useMemo(() => createRenderer(isBold), [createRenderer, isBold]);

  const convertToHtml = useCallback(
    async (markdown: string) => {
      const markedText = await marked(markdown, { renderer });
      return DOMPurify.sanitize(markedText);
    },
    [renderer],
  );

  return { convertToHtml };
};
