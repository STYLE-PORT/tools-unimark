import React, {forwardRef, useState} from "react";

type Props = {
  className?: string;
  onChange?: (value: string) => void;
  onInput?: (value: string) => void;
  value?: string;
  placeholder?: string;
}

export const EditorArea = forwardRef<HTMLTextAreaElement, Props>(({
                                                                    onInput: _onInput,
                                                                    onChange: _onChange,
                                                                    value: _value,
                                                                    className,
                                                                    ...rest
                                                                  }, ref) => {
  const [value, setValue] = useState(_value);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);
    _onChange?.(val);
  };

  const onInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const val = e.currentTarget.value;
    setValue(val);
    _onInput?.(val);
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const {selectionStart, selectionEnd, value} = textarea;

      const indent = !e.shiftKey ? +1 : -1;
      const lines = value.split("\n");

      let startAdjustmentCount = 0;
      let endAdjustmentCount = 0;

      const startLineIndex = value.substring(0, selectionStart).split("\n").length - 1;
      const endLineIndex = value.substring(0, selectionEnd).split("\n").length - 1;
      if (indent > 0) {
        let count = 0;
        for (let i = startLineIndex; i <= endLineIndex; i++) {
          lines[i] = "    " + lines[i];
          count += 4;
        }

        startAdjustmentCount = 4;
        endAdjustmentCount = count;
      } else {
        let firstLineCount = 0;
        let totalCount = 0;
        for (let i = startLineIndex; i <= endLineIndex; i++) {
          const count = Math.min(4, lines[i].match(/^ {1,4}/)?.[0].length || 0);
          lines[i] = lines[i].substring(count);
          totalCount += count;
          if (i === startLineIndex) {
            firstLineCount = count;
          }
        }

        startAdjustmentCount = -firstLineCount;
        endAdjustmentCount = -totalCount;
      }

      const updatedSelectionStart = selectionStart + startAdjustmentCount;
      const updatedSelectionEnd = selectionEnd + endAdjustmentCount;

      const newValue = lines.join("\n");

      setValue(newValue);
      _onInput?.(newValue);

      // Update cursor and selection range
      setTimeout(() => {
        textarea.selectionStart = updatedSelectionStart;
        textarea.selectionEnd = updatedSelectionEnd;
      }, 0);
    }
  };

  return (
    <textarea {...rest} onInput={onInput} value={value} ref={ref} onChange={onChange}
              onKeyDown={onKeyDown} className={className}>
    </textarea>
  );
});
