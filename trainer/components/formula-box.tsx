import { BlockFormula } from "@/components/math-formula";
import { normalizeLatex } from "@/lib/math-format";

interface FormulaBoxProps {
  formulas: string[];
  compact?: boolean;
}

export function FormulaBox({ formulas, compact = false }: FormulaBoxProps) {
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900 dark:bg-blue-950/40">
      <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200">
        Key formulas
      </h3>
      <ul
        className={`mt-3 space-y-3 text-blue-950 dark:text-blue-100 ${compact ? "max-h-56 overflow-auto pr-2" : ""}`}
      >
        {formulas.map((formula) => (
          <li
            key={formula}
            className="rounded-lg border border-blue-200 bg-white/70 p-3 dark:border-blue-800 dark:bg-slate-900/50"
          >
            <BlockFormula latex={normalizeLatex(formula)} className="text-base" />
          </li>
        ))}
      </ul>
    </section>
  );
}
