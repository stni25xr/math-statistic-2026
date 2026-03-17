"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AccessibilityContextValue {
  dyslexiaMode: boolean;
  toggleDyslexiaMode: () => void;
}

const STORAGE_KEY = "math-stat-2026-dyslexia-mode";

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(
  undefined,
);

function readInitialMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [dyslexiaMode, setDyslexiaMode] = useState(readInitialMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, dyslexiaMode ? "1" : "0");
    document.documentElement.classList.toggle("a11y-dyslexia", dyslexiaMode);
  }, [dyslexiaMode]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      dyslexiaMode,
      toggleDyslexiaMode: () => setDyslexiaMode((previous) => !previous),
    }),
    [dyslexiaMode],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }

  return context;
}
