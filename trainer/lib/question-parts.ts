export interface QuestionSubpart {
  key: string;
  label: string;
  body: string;
}

// Only treat labels as sub-question markers when they start at the beginning
// of text or right after whitespace. This avoids false positives like "A>B)".
const markerRegex = /(?:(?<=^)|(?<=\s))(\((?:[a-z]|i{1,3}|iv|v)\)|(?:[a-e]\)))/gi;

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

    const marker = current[1] ?? current[0];
    const markerStart = current.index ?? 0;
    const markerOffset = current[0].lastIndexOf(marker);
    const labelStart = markerStart + (markerOffset > -1 ? markerOffset : 0);
    const start = labelStart + marker.length;
    const end = next?.index ?? text.length;

    const body = text
      .slice(start, end)
      .replace(/^[\s,;:.\-]+/, "")
      .trim();

    parts.push({
      key: `${marker}-${i}`,
      label: marker,
      body,
    });
  }

  return {
    intro,
    parts,
  };
}
