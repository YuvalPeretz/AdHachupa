/**
 * Extracts up to 2 initials from a Hebrew (or any RTL) full name.
 *
 * Strategy:
 *  1. Split on whitespace.
 *  2. Take the first character of the first word and the first character of
 *     the last word (so "יובל פרץ ג'ון" → "יג").
 *  3. For a single-word name return only its first character.
 *  4. Empty / blank input returns an empty string.
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].charAt(0);
  return words[0].charAt(0) + words[words.length - 1].charAt(0);
}
