export type CategorySlug =
  | "standardization"
  | "poisson-process"
  | "bayes-total-probability"
  | "combinatorics"
  | "confidence-intervals"
  | "central-limit-theorem"
  | "hypothesis-tests"
  | "maximum-likelihood-estimation";

export type Difficulty = "easy" | "medium" | "exam-like";

export type ProgressRating = "understood" | "almost" | "need-review";

export interface CategoryDefinition {
  slug: CategorySlug;
  title: string;
  shortDescription: string;
  explanation: string;
  keyFormulas: string[];
  commonPatterns: string[];
  commonMistakes: string[];
  methodRecognition: string[];
  priorityRank: number;
}

export interface SolutionStep {
  title: string;
  detail: string;
}

export interface StudyQuestion {
  id: string;
  category: CategorySlug;
  subcategory: string;
  sourceExam: string;
  originalProblemNumber: string;
  title: string;
  question: string;
  formulasNeeded: string[];
  whyMethodApplies: string;
  steps: SolutionStep[];
  finalAnswer: string;
  difficulty: Difficulty;
  tags: string[];
  commonMistake: string;
  examShortcut: string;
  memorizeThis: string;
  patternHint: string;
  alternativeMethodWarning?: string;
  crossReferenceCategory?: CategorySlug;
}

export interface CrashPlanDay {
  day: "Day 1" | "Day 2" | "Day 3";
  focus: string;
  goals: string[];
  memorize: string[];
  drills: string[];
  skipIfShortOnTime: string[];
}
