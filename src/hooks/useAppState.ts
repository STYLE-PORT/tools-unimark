import { useCallback, useEffect, useRef, useState } from "react";

export const useAppState = () => {
  // 初期化済みかどうかを追跡するref
  // useRefを使用することで、Reactのデバッグモードでの2回レンダリングでも問題なく動作する
  const initializedRef = useRef<boolean>(false);

  // 初期値の取得
  const getInitialText = (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    const markdownParam = urlParams.get("markdown");
    const storedText = localStorage.getItem("text") || "";

    // URLパラメータがある場合は、それを初期値として使用
    // 確認ダイアログはuseEffect内で表示する
    if (markdownParam) {
      return markdownParam;
    }

    // パラメータがなく、localStorageに値がある場合
    if (storedText) {
      return storedText;
    }

    return "";
  };

  // 初期値を設定
  const [text, setText] = useState<string>(getInitialText());
  const [html, setHtml] = useState<string>("");
  const [showCopyStatus, setShowCopyStatus] = useState<boolean>(false);
  const [isBold, setIsBold] = useState<boolean>(true);
  const [isEdited, setIsEdited] = useState<boolean>(false);

  // URLパラメータの処理と確認ダイアログの表示を一度だけ行う
  useEffect(() => {
    // 既に初期化済みの場合は何もしない
    if (initializedRef.current) return;
    initializedRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const markdownParam = urlParams.get("markdown");

    if (!markdownParam) return; // パラメータがなければ何もしない

    const storedText = localStorage.getItem("text") || "";

    // 値が異なる場合、確認ダイアログを表示
    if (storedText && markdownParam !== storedText) {
      const useParam = window.confirm(
        "URLパラメータのテキストがセッションに保存されたテキストと異なります。\n\n" +
          "「OK」を押すとURLパラメータのテキストを使用します。\n" +
          "「キャンセル」を押すとセッションに保存されたテキストを使用します。",
      );

      if (useParam) {
        // URLパラメータを使用し、localStorageにも保存
        setText(markdownParam);
        localStorage.setItem("text", markdownParam);
      } else {
        // localStorageの値を使用
        setText(storedText);
      }
    } else {
      // 値が同じか、localStorageに値がない場合はパラメータを使用
      setText(markdownParam);
      localStorage.setItem("text", markdownParam);
    }

    // パラメータを削除（画面リフレッシュなし）
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
  }, []); // 空の依存配列で、マウント時に一度だけ実行

  // テキストを更新
  const updateText = useCallback((value: string) => {
    setText(value);
    localStorage.setItem("text", value);
    setIsEdited(true);
  }, []);

  // Tickerを表示
  const showCopyStatusWithTimeout = useCallback(() => {
    setShowCopyStatus(true);
    setTimeout(() => {
      setShowCopyStatus(false);
    }, 2000);
  }, []);

  // 見出しを太字でレンダリングするオプション（for Slack）
  const toggleBold = useCallback(() => {
    setIsBold((prev) => !prev);
  }, []);

  // テキストをURLパラメータとして含めたURLを生成しコピーする
  const copyAsUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ markdown: text }).toString();
    navigator.clipboard.writeText(url.toString());
    showCopyStatusWithTimeout();
  }, [text, showCopyStatusWithTimeout]);

  return {
    text,
    html,
    showCopyStatus,
    isBold,
    isEdited,
    updateText,
    setHtml,
    showCopyStatusWithTimeout,
    toggleBold,
    copyAsUrl,
  } as const;
};
