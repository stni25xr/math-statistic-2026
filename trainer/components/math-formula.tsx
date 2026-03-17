import katex from "katex";

interface FormulaProps {
  latex: string;
  className?: string;
}

function renderKatexHtml(latex: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
    });
  } catch {
    return null;
  }
}

export function InlineFormula({ latex, className = "" }: FormulaProps) {
  const html = renderKatexHtml(latex, false);

  if (!html) {
    return <code className={className}>{latex}</code>;
  }

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BlockFormula({ latex, className = "" }: FormulaProps) {
  const html = renderKatexHtml(latex, true);

  if (!html) {
    return <pre className={className}>{latex}</pre>;
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
