import { MathText } from "@/components/math-text";
import { parseQuestionParts } from "@/lib/question-parts";

interface ExamQuestionBlockProps {
  text: string;
}

export function ExamQuestionBlock({ text }: ExamQuestionBlockProps) {
  const parsed = parseQuestionParts(text);

  return (
    <section className="exam-paper rounded-xl border border-slate-300 bg-[#fffef8] p-5 text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
      {parsed.intro ? (
        <div className="exam-question-text text-xl leading-9">
          <MathText text={parsed.intro} />
        </div>
      ) : null}

      {parsed.parts.length > 0 ? (
        <ol className="mt-4 space-y-3">
          {parsed.parts.map((part) => (
            <li
              key={part.key}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="exam-question-text text-lg font-semibold text-slate-700 dark:text-slate-200">
                {part.label}
              </span>
              <div className="exam-question-text text-lg leading-8 text-slate-900 dark:text-slate-100">
                <MathText text={part.body} />
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
