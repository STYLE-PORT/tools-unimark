import {useCallback, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import {ArrowLeftToLine, ArrowRightToLine} from 'lucide-react';
import styles from './App.module.css';
import {EditorArea} from './components/EditorArea/EditorArea.tsx';
import {EditorToolbar} from './components/EditorToolbar/EditorToolbar.tsx';
import {useAppState} from './hooks/useAppState';
import {useClipboard} from './hooks/useClipboard';
import {useMarkdown} from './hooks/useMarkdown';
import {getPublicPath} from './utils/paths';

function App() {
  const {
    text,
    html,
    showCopyStatus,
    isBold,
    updateText,
    setHtml,
    showCopyStatusWithTimeout,
    toggleBold,
    copyAsUrl,
    updateUrlParams,
  } = useAppState();

  const outputRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const {convertToHtml} = useMarkdown(isBold);
  const {copyToClipboard} = useClipboard(outputRef);

  // URLパラメータから初期状態を決定
  const searchParams = new URLSearchParams(window.location.search);
  const isPreviewMode = searchParams.get('p') === '1' || searchParams.get('preview') === '1';

  // localStorageから初期値を取得
  const getInitialShowEditor = () => {
    // URLパラメータがある場合はそれを優先
    if (searchParams.has('p') || searchParams.has('preview')) {
      return !isPreviewMode;
    }
    // localStorageの値を使用（デフォルトはtrue）
    const saved = localStorage.getItem('showEditor');
    return saved !== null ? saved === 'true' : true;
  };

  const getInitialPaneWidth = () => {
    const saved = localStorage.getItem('leftPaneWidth');
    return saved !== null ? Number.parseFloat(saved) : 50;
  };

  const [showEditor, setShowEditor] = useState(getInitialShowEditor());
  const [isAnimating, setIsAnimating] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(getInitialPaneWidth());
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
    copyToClipboard({onCopySuccess: showCopyStatusWithTimeout});
  };

  // 日本語文字を判定
  const isJapanese = (char: string) => {
    const code = char.charCodeAt(0);
    return (
      (code >= 0x3040 && code <= 0x309f) || // ひらがな
      (code >= 0x30a0 && code <= 0x30ff) || // カタカナ
      (code >= 0x4e00 && code <= 0x9faf) || // 漢字
      (code >= 0xff00 && code <= 0xffef) // 全角
    );
  };

  // Markdownエディタの操作関数
  const toggleMarkdown = useCallback(
    (marker: string, placeholder?: string) => {
      if (!inputRef.current) return;

      const textarea = inputRef.current;
      const {selectionStart, selectionEnd, value} = textarea;
      const selectedText = value.substring(selectionStart, selectionEnd);
      const markerLength = marker.length;

      // まず、選択範囲の前後を確認して、すでにマーカーがあるかチェック
      const beforeMarker = value.substring(selectionStart - markerLength, selectionStart);
      const afterMarker = value.substring(selectionEnd, selectionEnd + markerLength);

      let newText: string;
      let newSelectionStart: number;
      let newSelectionEnd: number;

      // 選択範囲の前後にマーカーがある場合は削除
      if (beforeMarker === marker && afterMarker === marker) {
        newText =
          value.substring(0, selectionStart - markerLength) +
          selectedText +
          value.substring(selectionEnd + markerLength);
        newSelectionStart = selectionStart - markerLength;
        newSelectionEnd = selectionEnd - markerLength;
      }
      // 選択範囲自体がマーカーで囲まれている場合をチェック（`*`と`**`を区別）
      else if (
        marker === '**' &&
        selectedText.startsWith('**') &&
        selectedText.endsWith('**') &&
        selectedText.length >= 4
      ) {
        const innerText = selectedText.substring(2, selectedText.length - 2);
        newText = value.substring(0, selectionStart) + innerText + value.substring(selectionEnd);
        newSelectionStart = selectionStart;
        newSelectionEnd = selectionStart + innerText.length;
      } else if (
        marker === '*' &&
        selectedText.startsWith('*') &&
        selectedText.endsWith('*') &&
        !selectedText.startsWith('**') &&
        !selectedText.endsWith('**') &&
        selectedText.length >= 2
      ) {
        const innerText = selectedText.substring(1, selectedText.length - 1);
        newText = value.substring(0, selectionStart) + innerText + value.substring(selectionEnd);
        newSelectionStart = selectionStart;
        newSelectionEnd = selectionStart + innerText.length;
      } else if (
        marker === '`' &&
        selectedText.startsWith('`') &&
        selectedText.endsWith('`') &&
        selectedText.length >= 2
      ) {
        const innerText = selectedText.substring(1, selectedText.length - 1);
        newText = value.substring(0, selectionStart) + innerText + value.substring(selectionEnd);
        newSelectionStart = selectionStart;
        newSelectionEnd = selectionStart + innerText.length;
      }
      // マーカーを追加
      else {
        const textToInsert = selectedText || placeholder || '';

        // 日本語の場合、前後にスペースを追加
        let prefix = '';
        let suffix = '';

        if (textToInsert) {
          const beforeChar = value[selectionStart - 1] || '';
          const afterChar = value[selectionEnd] || '';
          const firstChar = textToInsert[0] || '';
          const lastChar = textToInsert[textToInsert.length - 1] || '';

          // 前にスペースが必要かチェック
          if (
            beforeChar &&
            beforeChar !== ' ' &&
            beforeChar !== '\n' &&
            (isJapanese(beforeChar) || isJapanese(firstChar))
          ) {
            prefix = ' ';
          }

          // 後にスペースが必要かチェック
          if (afterChar && afterChar !== ' ' && afterChar !== '\n' && (isJapanese(afterChar) || isJapanese(lastChar))) {
            suffix = ' ';
          }
        }

        newText =
          value.substring(0, selectionStart) +
          prefix +
          marker +
          textToInsert +
          marker +
          suffix +
          value.substring(selectionEnd);
        newSelectionStart = selectionStart + prefix.length + markerLength;
        newSelectionEnd = selectionEnd + prefix.length + markerLength;
      }

      updateText(newText);

      // カーソル位置を調整
      setTimeout(() => {
        textarea.selectionStart = newSelectionStart;
        textarea.selectionEnd = newSelectionEnd;
        textarea.focus();
      }, 0);
    },
    [updateText],
  );

  const handleBold = useCallback(() => toggleMarkdown('**', '太字'), [toggleMarkdown]);
  const handleItalic = useCallback(() => toggleMarkdown('*', 'イタリック'), [toggleMarkdown]);
  const handleLink = useCallback(() => {
    if (!inputRef.current) return;
    const textarea = inputRef.current;
    const {selectionStart, selectionEnd, value} = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd) || 'リンクテキスト';
    const newText = `${value.substring(0, selectionStart)}[${selectedText}](https://)${value.substring(selectionEnd)}`;
    updateText(newText);
    setTimeout(() => {
      const urlStart = selectionStart + selectedText.length + 3;
      textarea.selectionStart = urlStart;
      textarea.selectionEnd = urlStart + 8;
      textarea.focus();
    }, 0);
  }, [updateText]);
  const handleList = useCallback(() => {
    if (!inputRef.current) return;
    const textarea = inputRef.current;
    const {selectionStart, selectionEnd, value} = textarea;

    // 選択範囲の行を取得
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEnd = value.indexOf('\n', selectionEnd);
    const endPos = lineEnd === -1 ? value.length : lineEnd;

    const selectedLines = value.substring(lineStart, endPos);
    const lines = selectedLines.split('\n');

    const newLines = lines.map((line) => {
      // すでにリストアイテムの場合はスキップ
      if (line.trim().startsWith('- ')) return line;
      return `- ${line}`;
    });

    const newText = value.substring(0, lineStart) + newLines.join('\n') + value.substring(endPos);
    updateText(newText);

    setTimeout(() => {
      textarea.selectionStart = lineStart;
      textarea.selectionEnd = lineStart + newLines.join('\n').length;
      textarea.focus();
    }, 0);
  }, [updateText]);

  const handleOrderedList = useCallback(() => {
    if (!inputRef.current) return;
    const textarea = inputRef.current;
    const {selectionStart, selectionEnd, value} = textarea;

    // 選択範囲の行を取得
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEnd = value.indexOf('\n', selectionEnd);
    const endPos = lineEnd === -1 ? value.length : lineEnd;

    const selectedLines = value.substring(lineStart, endPos);
    const lines = selectedLines.split('\n');

    const newLines = lines.map((line, index) => {
      // すでに番号付きリストの場合はスキップ
      if (line.trim().match(/^\d+\. /)) return line;
      return `${index + 1}. ${line}`;
    });

    const newText = value.substring(0, lineStart) + newLines.join('\n') + value.substring(endPos);
    updateText(newText);

    setTimeout(() => {
      textarea.selectionStart = lineStart;
      textarea.selectionEnd = lineStart + newLines.join('\n').length;
      textarea.focus();
    }, 0);
  }, [updateText]);
  const handleQuote = useCallback(() => {
    if (!inputRef.current) return;
    const textarea = inputRef.current;
    const {selectionStart, selectionEnd, value} = textarea;

    // 選択範囲の行を取得
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEnd = value.indexOf('\n', selectionEnd);
    const endPos = lineEnd === -1 ? value.length : lineEnd;

    const selectedLines = value.substring(lineStart, endPos);
    const lines = selectedLines.split('\n');

    const newLines = lines.map((line) => {
      // すでに引用の場合はスキップ
      if (line.trim().startsWith('> ')) return line;
      return `> ${line}`;
    });

    const newText = value.substring(0, lineStart) + newLines.join('\n') + value.substring(endPos);
    updateText(newText);

    setTimeout(() => {
      textarea.selectionStart = lineStart;
      textarea.selectionEnd = lineStart + newLines.join('\n').length;
      textarea.focus();
    }, 0);
  }, [updateText]);
  const handleCode = useCallback(() => {
    if (!inputRef.current) return;
    const textarea = inputRef.current;
    const {selectionStart, selectionEnd, value} = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);

    // 改行が含まれているかチェック
    if (selectedText.includes('\n')) {
      // 複数行の場合はコードブロック
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineEnd = value.indexOf('\n', selectionEnd);
      const endPos = lineEnd === -1 ? value.length : lineEnd;

      // コードブロックの前後に改行を追加
      const prefix = lineStart > 0 ? '\n' : '';
      const suffix = endPos < value.length ? '\n' : '';

      const newText = `${value.substring(0, lineStart) + prefix}\`\`\`\n${selectedText}\n\`\`\`${suffix}${value.substring(endPos)}`;
      updateText(newText);

      setTimeout(() => {
        textarea.selectionStart = lineStart + prefix.length + 4;
        textarea.selectionEnd = lineStart + prefix.length + 4 + selectedText.length;
        textarea.focus();
      }, 0);
    } else {
      // 単一行の場合はインラインコード
      toggleMarkdown('`', 'コード');
    }
  }, [toggleMarkdown, updateText]);

  const toggleEditor = useCallback(() => {
    setIsAnimating(true);
    const newShowEditor = !showEditor;
    setShowEditor(newShowEditor);
    localStorage.setItem('showEditor', String(newShowEditor));
    updateUrlParams(text, newShowEditor);

    // アニメーション終了後にフラグをリセット
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [showEditor, text, updateUrlParams]);

  // グローバルキーボードショートカット
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // フォーカスされている要素を確認
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.getAttribute('contenteditable') === 'true');

      // 入力要素にフォーカスがない場合のみ
      if (!isInputFocused && e.key === 'e') {
        e.preventDefault();
        toggleEditor();
      }

      // ESCキーでフォーカスを外す
      if (isInputFocused && e.key === 'Escape') {
        e.preventDefault();
        (activeElement as HTMLElement).blur();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleEditor]);

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
        localStorage.setItem('leftPaneWidth', String(newWidth));
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
          className={clsx(styles.markdown, styles.pane, !showEditor && styles.hidden, isAnimating && styles.animating)}
          style={{
            flexBasis: showEditor ? `${leftPaneWidth}%` : '0%',
            opacity: showEditor ? 1 : 0,
          }}
        >
          <h2 className={styles.title}>
            <img className={styles.logo} src={getPublicPath('uni.svg')} alt="Uni"/> Markdown
          </h2>
          <EditorToolbar
            onBold={handleBold}
            onItalic={handleItalic}
            onLink={handleLink}
            onList={handleList}
            onOrderedList={handleOrderedList}
            onQuote={handleQuote}
            onCode={handleCode}
          />
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
          style={{opacity: showEditor ? 1 : 0}}
        />

        <section
          className={clsx(styles.outputGroup, styles.pane, !showEditor && styles.fullWidth)}
          style={{
            flexBasis: showEditor ? `${100 - leftPaneWidth}%` : '100%',
            flexGrow: showEditor ? 0 : 1,
          }}
        >
          <div className={styles.titleBar}>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={toggleEditor}
              aria-label={showEditor ? 'エディタを隠す' : 'エディタを表示'}
            >
              {showEditor ? <ArrowLeftToLine size={18}/> : <ArrowRightToLine size={18}/>}
            </button>
            <h2 className={styles.title}>Preview</h2>
          </div>
          <section ref={outputRef} className={styles.outputSection}>
            <output className={styles.output} dangerouslySetInnerHTML={{__html: html}}/>
          </section>
          <div className={styles.controls}>
            <label>
              <input type="checkbox" className="mr-2" checked={isBold} onChange={toggleBold}/>
              &nbsp;見出しを太字としてレンダリング
            </label>
            <div className={styles.buttonGroup}>
              <button type="button" className={clsx(styles.button, styles.isPrimary)} onClick={handleCopy}>
                Copy
              </button>
              <button
                type="button"
                className={clsx(styles.button, styles.isSecondary)}
                onClick={() => copyAsUrl(showEditor)}
              >
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
