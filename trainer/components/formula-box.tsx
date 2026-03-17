interface FormulaBoxProps {
  formulas: string[];
  compact?: boolean;
}

export function FormulaBox({ formulas, compact = false }: FormulaBoxProps) {
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900 dark:bg-blue-950/40">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
        Key formulas
      </h3>
      <ul
        className={`mt-3 list-disc space-y-2 pl-5 text-sm text-blue-950 dark:text-blue-100 ${compact ? "max-h-44 overflow-auto" : ""}`}
      >
        {formulas.map((formula) => (
          <li key={formula} className="leading-relaxed">
            {formula}
          </li>
        ))}
      </ul>
    </section>
  );
}
