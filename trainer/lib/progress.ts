import { ProgressRating } from "@/lib/types";

export interface ProgressState {
  completed: string[];
  review: string[];
  ratings: Record<string, ProgressRating>;
}

export const PROGRESS_STORAGE_KEY = "math-stat-2026-progress-v1";

export const defaultProgressState: ProgressState = {
  completed: [],
  review: [],
  ratings: {},
};

export function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function safeParseProgress(raw: string | null): ProgressState {
  if (!raw) {
    return defaultProgressState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      review: Array.isArray(parsed.review) ? parsed.review : [],
      ratings:
        parsed.ratings && typeof parsed.ratings === "object"
          ? parsed.ratings
          : {},
    };
  } catch {
    return defaultProgressState;
  }
}
