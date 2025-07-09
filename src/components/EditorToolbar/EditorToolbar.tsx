import {Bold, Code, Italic, Link, List, ListOrdered, Quote} from 'lucide-react';
import styles from './EditorToolbar.module.css';

interface EditorToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onLink: () => void;
  onList: () => void;
  onOrderedList: () => void;
  onQuote: () => void;
  onCode: () => void;
}

export const EditorToolbar = ({
                                onBold,
                                onItalic,
                                onLink,
                                onList,
                                onOrderedList,
                                onQuote,
                                onCode,
                              }: EditorToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <button type="button" className={styles.button} onClick={onBold} title="太字 (Cmd/Ctrl+B)" aria-label="太字">
        <Bold size={16}/>
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={onItalic}
        title="イタリック (Cmd/Ctrl+I)"
        aria-label="イタリック"
      >
        <Italic size={16}/>
      </button>
      <div className={styles.separator}/>
      <button type="button" className={styles.button} onClick={onLink} title="リンク" aria-label="リンク">
        <Link size={16}/>
      </button>
      <button type="button" className={styles.button} onClick={onList} title="箇条書き" aria-label="箇条書き">
        <List size={16}/>
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={onOrderedList}
        title="番号付きリスト"
        aria-label="番号付きリスト"
      >
        <ListOrdered size={16}/>
      </button>
      <button type="button" className={styles.button} onClick={onQuote} title="引用" aria-label="引用">
        <Quote size={16}/>
      </button>
      <button type="button" className={styles.button} onClick={onCode} title="コード" aria-label="コード">
        <Code size={16}/>
      </button>
    </div>
  );
};
