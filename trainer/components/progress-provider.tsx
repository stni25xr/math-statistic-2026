"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultProgressState,
  PROGRESS_STORAGE_KEY,
  ProgressState,
  safeParseProgress,
  toggleId,
} from "@/lib/progress";
import { ProgressRating } from "@/lib/types";

interface ProgressContextValue {
  progress: ProgressState;
  toggleCompleted: (questionId: string) => void;
  toggleReview: (questionId: string) => void;
  setRating: (questionId: string, rating: ProgressRating) => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

function getInitialProgress(): ProgressState {
  if (typeof window === "undefined") {
    return defaultProgressState;
  }

  return safeParseProgress(localStorage.getItem(PROGRESS_STORAGE_KEY));
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(getInitialProgress);

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      toggleCompleted: (questionId: string) => {
        setProgress((previous) => ({
          ...previous,
          completed: toggleId(previous.completed, questionId),
        }));
      },
      toggleReview: (questionId: string) => {
        setProgress((previous) => ({
          ...previous,
          review: toggleId(previous.review, questionId),
        }));
      },
      setRating: (questionId: string, rating: ProgressRating) => {
        setProgress((previous) => ({
          ...previous,
          ratings: {
            ...previous.ratings,
            [questionId]: rating,
          },
        }));
      },
    }),
    [progress],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider");
  }

  return context;
}
