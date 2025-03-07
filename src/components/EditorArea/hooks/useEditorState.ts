import { useState, useCallback, useEffect } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useIndentation } from "./useIndentation";

type EditorCallbacks = {
  readonly onChange?: (value: string) => void;
  readonly onInput?: (value: string) => void;
};

export const useEditorState = (
  initialValue: string | undefined,
  callbacks: EditorCallbacks
) => {
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
    [callbacks]
  );

  const onInput = useCallback(
    (e: FormEvent<HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setValue(newValue);
      callbacks.onInput?.(newValue);
    },
    [callbacks]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const { selectionStart, selectionEnd, value: currentValue } = textarea;

        const result = handleIndentation(
          currentValue,
          selectionStart,
          selectionEnd,
          !e.shiftKey
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
    [callbacks, handleIndentation]
  );

  return {
    value,
    onChange,
    onInput,
    onKeyDown,
  } as const;
};