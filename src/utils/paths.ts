/**
 * publicディレクトリ内のファイルへの正しいパスを生成する
 * 開発環境と本番環境（baseパスが異なる）の両方で動作する
 *
 * @param path - publicディレクトリからの相対パス（先頭のスラッシュなし）
 * @returns 環境に応じた正しいパス
 *
 * @example
 * // 使用例
 * const logoPath = getPublicPath('uni.svg');
 * // 開発環境: '/uni.svg'
 * // 本番環境: '/tools-unimark/uni.svg'
 */
export const getPublicPath = (path: string): string => {
  // パスの先頭にスラッシュがある場合は削除
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // import.meta.env.BASE_URLは末尾にスラッシュを含む
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};
