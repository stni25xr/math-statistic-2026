import { MathText } from "@/components/math-text";

interface ExamQuestionBlockProps {
  text: string;
}

interface Subpart {
  label: string;
  body: string;
}

const markerRegex = /\(([a-z]|i{1,3}|iv|v)\)/gi;

function parseSubparts(text: string): { intro: string; parts: Subpart[] } {
  const matches = Array.from(text.matchAll(markerRegex));

  if (matches.length === 0) {
    return { intro: text, parts: [] };
  }

  const intro = text.slice(0, matches[0].index).trim();
  const parts: Subpart[] = [];

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
      label: current[0],
      body,
    });
  }

  return {
    intro,
    parts,
  };
}

export function ExamQuestionBlock({ text }: ExamQuestionBlockProps) {
  const parsed = parseSubparts(text);

  return (
    <section className="rounded-xl border border-slate-300 bg-[#fffef8] p-5 text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
      {parsed.intro ? (
        <div className="font-['Times_New_Roman',serif] text-xl leading-9">
          <MathText text={parsed.intro} />
        </div>
      ) : null}

      {parsed.parts.length > 0 ? (
        <ol className="mt-4 space-y-3">
          {parsed.parts.map((part) => (
            <li
              key={`${part.label}-${part.body}`}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="font-['Times_New_Roman',serif] text-lg font-semibold text-slate-700 dark:text-slate-200">
                {part.label}
              </span>
              <div className="font-['Times_New_Roman',serif] text-lg leading-8 text-slate-900 dark:text-slate-100">
                <MathText text={part.body} />
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
