import type { ReactNode } from "react";

/**
 * Presentation helper: wraps the first occurrence of `word` in a span.
 * The copy itself always comes from src/content/orbyt.ts; this only
 * colors one existing word (e.g. "system", "connects") in orange.
 */
export function emphasize(
  text: string,
  word: string,
  className = "text-primary"
): ReactNode {
  const index = text.indexOf(word);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className={className}>{word}</span>
      {text.slice(index + word.length)}
    </>
  );
}
