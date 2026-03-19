export interface QuestionSubpart {
  key: string;
  label: string;
  body: string;
}

const markerRegex = /(?:\(([a-z]|i{1,3}|iv|v)\)|\b([a-e])\))/gi;

export function parseQuestionParts(text: string): {
  intro: string;
  parts: QuestionSubpart[];
} {
  const matches = Array.from(text.matchAll(markerRegex));

  if (matches.length === 0) {
    return { intro: text, parts: [] };
  }

  const intro = text.slice(0, matches[0].index).trim();
  const parts: QuestionSubpart[] = [];

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];

    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? text.length;

    const body = text
      .slice(start, end)
      .replace(/^[\s,;:.\-]+/, "")
      .trim();

    parts.push({
      key: `${current[0]}-${i}`,
      label: current[0],
      body,
    });
  }

  return {
    intro,
    parts,
  };
}
