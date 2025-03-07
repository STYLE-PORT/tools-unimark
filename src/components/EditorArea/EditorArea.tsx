import {forwardRef} from "react";
import {useEditorState} from "./hooks/useEditorState";
import styles from "./EditorArea.module.css";

type Props = {
  readonly className?: string;
  readonly onChange?: (value: string) => void;
  readonly onInput?: (value: string) => void;
  readonly value?: string;
  readonly placeholder?: string;
};

export const EditorArea = forwardRef<HTMLTextAreaElement, Props>(
  (
    {onInput, onChange, value: initialValue, className, ...rest},
    ref
  ) => {
    const {value, onChange: handleChange, onInput: handleInput, onKeyDown} =
      useEditorState(initialValue, {onChange, onInput});

    return (
      <textarea
        {...rest}
        ref={ref}
        value={value}
        onChange={handleChange}
        onInput={handleInput}
        onKeyDown={onKeyDown}
        className={`${styles.textarea} ${className || ""}`}
      />
    );
  }
);

EditorArea.displayName = "EditorArea";
