import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { useIndentation } from './useIndentation';

type EditorCallbacks = {
  readonly onChange?: (value: string) => void;
  readonly onInput?: (value: string) => void;
};

export const useEditorState = (initialValue: string | undefined, callbacks: EditorCallbacks) => {
  const [value, setValue] = useState(initialValue);
  const { handleIndentation } = useIndentation();

  // initialValueが変更されたときにvalueを更新
  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      callbacks.onChange?.(newValue);
    },
    [callbacks],
  );

  const onInput = useCallback(
    (e: FormEvent<HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setValue(newValue);
      callbacks.onInput?.(newValue);
    },
    [callbacks],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd, value: currentValue } = textarea;
      
      // 日本語文字を判定
      const isJapanese = (char: string) => {
        const code = char.charCodeAt(0);
        return (
          (code >= 0x3040 && code <= 0x309f) || // ひらがな
          (code >= 0x30a0 && code <= 0x30ff) || // カタカナ
          (code >= 0x4e00 && code <= 0x9faf) || // 漢字
          (code >= 0xff00 && code <= 0xffef)    // 全角
        );
      };

      // Markdownトグル関数
      const toggleMarkdown = (marker: string) => {
        const selectedText = currentValue.substring(selectionStart, selectionEnd);
        const markerLength = marker.length;
        const beforeMarker = currentValue.substring(selectionStart - markerLength, selectionStart);
        const afterMarker = currentValue.substring(selectionEnd, selectionEnd + markerLength);
        
        let newValue: string;
        let newSelectionStart: number;
        let newSelectionEnd: number;
        
        // 選択範囲の前後にマーカーがある場合は削除
        if (beforeMarker === marker && afterMarker === marker) {
          newValue = currentValue.substring(0, selectionStart - markerLength) + 
                    selectedText + 
                    currentValue.substring(selectionEnd + markerLength);
          newSelectionStart = selectionStart - markerLength;
          newSelectionEnd = selectionEnd - markerLength;
        } 
        // 選択範囲自体がマーカーで囲まれている場合をチェック（`*`と`**`を区別）
        else if (marker === '**' && selectedText.startsWith('**') && selectedText.endsWith('**') && selectedText.length >= 4) {
          const innerText = selectedText.substring(2, selectedText.length - 2);
          newValue = currentValue.substring(0, selectionStart) + 
                    innerText + 
                    currentValue.substring(selectionEnd);
          newSelectionStart = selectionStart;
          newSelectionEnd = selectionStart + innerText.length;
        }
        else if (marker === '*' && selectedText.startsWith('*') && selectedText.endsWith('*') && 
                 !selectedText.startsWith('**') && !selectedText.endsWith('**') && selectedText.length >= 2) {
          const innerText = selectedText.substring(1, selectedText.length - 1);
          newValue = currentValue.substring(0, selectionStart) + 
                    innerText + 
                    currentValue.substring(selectionEnd);
          newSelectionStart = selectionStart;
          newSelectionEnd = selectionStart + innerText.length;
        }
        // マーカーを追加
        else {
          let prefix = '';
          let suffix = '';
          
          if (selectedText) {
            const beforeChar = currentValue[selectionStart - 1] || '';
            const afterChar = currentValue[selectionEnd] || '';
            const firstChar = selectedText[0] || '';
            const lastChar = selectedText[selectedText.length - 1] || '';
            
            // 前にスペースが必要かチェック
            if (beforeChar && beforeChar !== ' ' && beforeChar !== '\n' && 
                (isJapanese(beforeChar) || isJapanese(firstChar))) {
              prefix = ' ';
            }
            
            // 後にスペースが必要かチェック
            if (afterChar && afterChar !== ' ' && afterChar !== '\n' && 
                (isJapanese(afterChar) || isJapanese(lastChar))) {
              suffix = ' ';
            }
          }
          
          newValue = currentValue.substring(0, selectionStart) + 
                    prefix + marker + selectedText + marker + suffix + 
                    currentValue.substring(selectionEnd);
          newSelectionStart = selectionStart + prefix.length + markerLength;
          newSelectionEnd = selectionEnd + prefix.length + markerLength;
        }
        
        setValue(newValue);
        callbacks.onInput?.(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = newSelectionStart;
          textarea.selectionEnd = newSelectionEnd;
        }, 0);
      };

      // Cmd/Ctrl + B for bold
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleMarkdown('**');
      }
      
      // Cmd/Ctrl + I for italic
      else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        toggleMarkdown('*');
      }
      
      // Tab key handling
      else if (e.key === 'Tab') {
        e.preventDefault();
        const result = handleIndentation(
          currentValue,
          selectionStart,
          selectionEnd,
          !e.shiftKey ? 'indent' : 'outdent',
        );

        setValue(result.newValue);
        callbacks.onInput?.(result.newValue);

        // Update cursor and selection range
        setTimeout(() => {
          textarea.selectionStart = result.selectionStart;
          textarea.selectionEnd = result.selectionEnd;
        }, 0);
      }
    },
    [callbacks, handleIndentation],
  );

  return {
    value,
    onChange,
    onInput,
    onKeyDown,
  } as const;
};
