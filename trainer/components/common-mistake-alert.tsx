interface CommonMistakeAlertProps {
  mistake: string;
}

export function CommonMistakeAlert({
  mistake,
}: CommonMistakeAlertProps) {
  return (
    <aside className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
      <p className="font-semibold">Common mistake</p>
      <p className="mt-1">{mistake}</p>
    </aside>
  );
}
