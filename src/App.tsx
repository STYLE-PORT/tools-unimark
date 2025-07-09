import { useEffect, useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import styles from './App.module.css';
import { EditorArea } from './components/EditorArea/EditorArea.tsx';
import { useAppState } from './hooks/useAppState';
import { useClipboard } from './hooks/useClipboard';
import { useMarkdown } from './hooks/useMarkdown';
import { getPublicPath } from './utils/paths';

function App() {
  const { text, html, showCopyStatus, isBold, updateText, setHtml, showCopyStatusWithTimeout, toggleBold, copyAsUrl, updateUrlParams } =
    useAppState();

  const outputRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { convertToHtml } = useMarkdown(isBold);
  const { copyToClipboard } = useClipboard(outputRef);
  
  // URLパラメータから初期状態を決定
  const searchParams = new URLSearchParams(window.location.search);
  const isPreviewMode = searchParams.get('p') === '1' || searchParams.get('preview') === '1';
  
  const [showEditor, setShowEditor] = useState(!isPreviewMode);
  const [isAnimating, setIsAnimating] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // テキスト変更時にURLを更新
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrlParams(text, showEditor);
    }, 500); // デバウンス処理

    return () => clearTimeout(timeoutId);
  }, [text, showEditor, updateUrlParams]);

  useEffect(() => {
    (async () => {
      const newHtml = await convertToHtml(text);
      setHtml(newHtml);
    })();
  }, [text, convertToHtml, setHtml]);

  const handleCopy = () => {
    copyToClipboard({ onCopySuccess: showCopyStatusWithTimeout });
  };

  const toggleEditor = () => {
    setIsAnimating(true);
    const newShowEditor = !showEditor;
    setShowEditor(newShowEditor);
    updateUrlParams(text, newShowEditor);
    
    // アニメーション終了後にフラグをリセット
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const container = document.querySelector(`.${styles.editorGroup}`);
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // 幅を10%〜90%の範囲に制限
      if (newWidth >= 10 && newWidth <= 90) {
        setLeftPaneWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <main className={styles.main}>
      <div className={clsx(styles.editorGroup, isResizing && styles.isResizing, isAnimating && styles.isAnimating)}>
        <section 
          className={clsx(
            styles.markdown, 
            styles.pane,
            !showEditor && styles.hidden,
            isAnimating && styles.animating
          )} 
          style={{ 
            flexBasis: showEditor ? `${leftPaneWidth}%` : '0%',
            opacity: showEditor ? 1 : 0
          }}
        >
          <h2 className={styles.title}>
            <img className={styles.logo} src={getPublicPath('uni.svg')} alt="Uni" /> Markdown
          </h2>
          <EditorArea
            ref={inputRef}
            placeholder="Markdownのテキストを入力"
            className={styles.input}
            onInput={updateText}
            value={text}
          />
        </section>
        
        <div 
          ref={resizeHandleRef}
          className={clsx(styles.resizeHandle, !showEditor && styles.hidden)}
          onMouseDown={handleMouseDown}
          style={{ opacity: showEditor ? 1 : 0 }}
        />
        
        <section 
          className={clsx(styles.outputGroup, styles.pane, !showEditor && styles.fullWidth)}
          style={{ 
            flexBasis: showEditor ? `${100 - leftPaneWidth}%` : '100%',
            flexGrow: showEditor ? 0 : 1
          }}
        >
          <div className={styles.titleBar}>
            <button 
              type="button" 
              className={styles.toggleButton}
              onClick={toggleEditor}
              aria-label={showEditor ? "エディタを隠す" : "エディタを表示"}
            >
              {showEditor ? <ArrowLeftToLine size={18} /> : <ArrowRightToLine size={18} />}
            </button>
            <h2 className={styles.title}>HTML</h2>
          </div>
          <section ref={outputRef} className={styles.output} dangerouslySetInnerHTML={{ __html: html }} />
          <div className={styles.controls}>
            <label>
              <input type="checkbox" className="mr-2" checked={isBold} onChange={toggleBold} />
              見出しを太字としてレンダリング
            </label>
            <div className={styles.buttonGroup}>
              <button type="button" className={clsx(styles.button, styles.isPrimary)} onClick={handleCopy}>
                Copy
              </button>
              <button type="button" className={clsx(styles.button, styles.isSecondary)} onClick={() => copyAsUrl(showEditor)}>
                Copy as URL
              </button>
            </div>
          </div>
        </section>
      </div>
      <div className={clsx(styles.ticker, showCopyStatus && styles.show)}>コピーしました！</div>
    </main>
  );
}

export default App;
