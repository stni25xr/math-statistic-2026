import { StudyQuestion } from "@/lib/types";

function parseExamDate(sourceExam: string): { year: number; month: number } {
  const match = sourceExam.match(/(\d{4})-(\d{2})/);
  if (!match) {
    return { year: 9999, month: 99 };
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}

function parseProblemNumber(raw: string): number {
  const match = raw.match(/\d+/);
  if (!match) {
    return 999;
  }
  return Number(match[0]);
}

export function compareQuestionsByExamOrder(
  a: StudyQuestion,
  b: StudyQuestion,
): number {
  const da = parseExamDate(a.sourceExam);
  const db = parseExamDate(b.sourceExam);

  if (da.year !== db.year) {
    return da.year - db.year;
  }
  if (da.month !== db.month) {
    return da.month - db.month;
  }

  const examCompare = a.sourceExam.localeCompare(b.sourceExam);
  if (examCompare !== 0) {
    return examCompare;
  }

  const pa = parseProblemNumber(a.originalProblemNumber);
  const pb = parseProblemNumber(b.originalProblemNumber);
  if (pa !== pb) {
    return pa - pb;
  }

  return a.id.localeCompare(b.id);
}

export function sortQuestionsByExamOrder(
  questions: StudyQuestion[],
): StudyQuestion[] {
  return [...questions].sort(compareQuestionsByExamOrder);
}
