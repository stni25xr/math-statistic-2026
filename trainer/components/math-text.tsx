import { ReactNode } from "react";
import { InlineFormula } from "@/components/math-formula";
import { mathTokenRegex, normalizeLatex } from "@/lib/math-format";

interface MathTextProps {
  text: string;
  className?: string;
}

export function MathText({ text, className = "" }: MathTextProps) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  const matcher = new RegExp(mathTokenRegex);
  let match = matcher.exec(text);

  while (match) {
    const token = match[0];
    const start = match.index;

    if (start > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`}>{text.slice(lastIndex, start)}</span>,
      );
    }

    parts.push(
      <InlineFormula
        key={`m-${start}`}
        latex={normalizeLatex(token)}
        className="mx-0.5"
      />,
    );

    lastIndex = start + token.length;
    match = matcher.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return (
    <span className={`leading-relaxed whitespace-pre-wrap ${className}`}>{parts}</span>
  );
}
