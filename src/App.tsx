import { useEffect, useRef } from "react";
import styles from "./App.module.css";
import { EditorArea } from "./components/EditorArea/EditorArea.tsx";
import { useAppState } from "./hooks/useAppState";
import { useClipboard } from "./hooks/useClipboard";
import { useMarkdown } from "./hooks/useMarkdown";
import { getPublicPath } from "./utils/paths";

function App() {
  const { text, html, showCopyStatus, isBold, updateText, setHtml, showCopyStatusWithTimeout, toggleBold, copyAsUrl } =
    useAppState();

  const outputRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { convertToHtml } = useMarkdown(isBold);
  const { copyToClipboard } = useClipboard(outputRef);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    (async () => {
      const newHtml = await convertToHtml(text);
      setHtml(newHtml);
    })();
  }, [text, convertToHtml, setHtml]);

  const handleCopy = () => {
    copyToClipboard(showCopyStatusWithTimeout);
  };

  return (
    <main className={styles.main}>
      <div className={styles.editorGroup}>
        <section className={`${styles.markdown} ${styles.pane}`}>
          <h2 className={styles.title}>
            <img className={styles.logo} src={getPublicPath("uni.svg")} alt="Uni" /> Markdown
          </h2>
          <EditorArea
            ref={inputRef}
            placeholder="Markdownのテキストを入力"
            className={styles.input}
            onInput={updateText}
            value={text}
          />
        </section>
        <section className={`${styles.outputGroup} ${styles.pane}`}>
          <h2 className={styles.title}>HTML</h2>
          <section ref={outputRef} className={styles.output} dangerouslySetInnerHTML={{ __html: html }} />
          <div className={styles.controls}>
            <label>
              <input type="checkbox" className="mr-2" checked={isBold} onChange={toggleBold} />
              見出しを太字としてレンダリング
            </label>
            <div className={styles.buttonGroup}>
              <button type="button" className={`${styles.button} ${styles.isPrimary}`} onClick={handleCopy}>
                Copy
              </button>
              <button type="button" className={`${styles.button} ${styles.isSecondary}`} onClick={copyAsUrl}>
                Copy as URL
              </button>
            </div>
          </div>
        </section>
      </div>
      <div className={`${styles.ticker} ${showCopyStatus ? styles.show : ""}`}>コピーしました！</div>
    </main>
  );
}

export default App;
