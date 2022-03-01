/**
 * Sometimes the index starts from 1, other times it's 1000, 1001, etc.
 * @param nativeIndex The native system's button index.
 * @returns The 0-based index of the button that was clicked.
 */
export const getAlertButtonIndex = (nativeIndex: number): number => {
  return nativeIndex >= 1000 ? nativeIndex % 1000 : nativeIndex - 1
}
