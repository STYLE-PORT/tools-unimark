type IndentationResult = {
  newValue: string;
  selectionStart: number;
  selectionEnd: number;
};

export const useIndentation = () => {
  const handleIndentation = (
    value: string,
    selectionStart: number,
    selectionEnd: number,
    isIndent: boolean
  ): IndentationResult => {
    const indentString = " ".repeat(2);
    const lines = value.split("\n");
    let startAdjustmentCount = 0;
    let endAdjustmentCount = 0;

    const startLineIndex = value.substring(0, selectionStart).split("\n").length - 1;
    const endLineIndex = value.substring(0, selectionEnd).split("\n").length - 1;

    if (isIndent) {
      let count = 0;
      for (let i = startLineIndex; i <= endLineIndex; i++) {
        lines[i] = indentString + lines[i];
        count += indentString.length;
      }

      startAdjustmentCount = indentString.length;
      endAdjustmentCount = count;
    } else {
      let firstLineCount = 0;
      let totalCount = 0;
      for (let i = startLineIndex; i <= endLineIndex; i++) {
        // 行の先頭にあるすべてのスペースを検出
        const leadingSpaces = lines[i].match(/^[ ]+/)?.[0] || "";
        
        // 削除するスペースの数（最大でindentString.lengthまで）
        const count = Math.min(indentString.length, leadingSpaces.length);
        
        lines[i] = lines[i].substring(count);
        totalCount += count;
        if (i === startLineIndex) {
          firstLineCount = count;
        }
      }

      startAdjustmentCount = -firstLineCount;
      endAdjustmentCount = -totalCount;
    }

    return {
      newValue: lines.join("\n"),
      selectionStart: selectionStart + startAdjustmentCount,
      selectionEnd: selectionEnd + endAdjustmentCount,
    };
  };

  return { handleIndentation };
};