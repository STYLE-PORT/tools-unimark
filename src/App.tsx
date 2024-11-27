import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './App.css'
import {marked, Renderer} from "marked";
import DOMPurify from "dompurify";
import {EditorArea} from "./components/EditorArea.tsx";

function App() {
  const [text, setText] = useState<string>(localStorage.getItem("text") || "");
  const [html, setHtml] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isBold, setIsBold] = useState<boolean>(true);
  const outputRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  marked.use({
    breaks: true,
    gfm: true
  });

  const renderer = useMemo<Renderer>(() => {
    const r = new marked.Renderer();
    r.heading = ({text, depth}) => {
      return isBold ? `<h${depth}><strong>${text}</strong></h${depth}>` : `<h${depth}>${text}</h${depth}>`;
    };
    return r;
  }, [isBold]);


  const onInput = (value: string) => {
    setText(value);
    localStorage.setItem("text", value);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    (async () => {
      const markedText = await marked(text, {renderer});
      setHtml(DOMPurify.sanitize(markedText));
    })();
  }, [text, isBold, renderer]);

  const copyToClipboard = useCallback(() => {
    if (outputRef.current) {
      const range = document.createRange();
      range.selectNodeContents(outputRef.current);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      try {
        document.execCommand("copy");
        setStatus("Copied!");
      } catch (err) {
        setStatus("failed to copy");
        console.error(err);
      }

      // 選択を解除
      selection?.removeAllRanges();
    }
  }, []);

  return (
    <>
      <main className="main h-full min-h-lvh flex flex-col px-2">
        <section className="editor-group">
          <section className="markdown pane">
            <h2 className="rubik-bold text-xl p-2 bg-gray-100 mb-4">✹ Markdown</h2>
            <EditorArea ref={inputRef} placeholder="Markdownのでキストを入力" className="input w-full grow block"
                        onInput={onInput} value={text}>
            </EditorArea>
          </section>
          <section className="output-group pane">
            <h2 className="rubik-bold text-xl p-2 bg-gray-100 mb-4">HTML</h2>
            <section ref={outputRef} className="output bg-gray-50 p-4" dangerouslySetInnerHTML={{__html: html}}>
            </section>
            <div className="flex flex-col">
              <label className="block w-fit">
                <input type="checkbox" className="inline" checked={isBold}
                       onChange={() => setIsBold(!isBold)}/> 見出しを太字としてレンダリング
              </label>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button className="button" onClick={copyToClipboard}>Copy</button>
              <span>{status}</span>
            </div>
          </section>
        </section>
      </main>
    </>
  )
}

export default App
