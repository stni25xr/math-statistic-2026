"use client";

import { ReactNode } from "react";
import { AccessibilityProvider } from "@/components/accessibility-provider";
import { ProgressProvider } from "@/components/progress-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AccessibilityProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </AccessibilityProvider>
  );
}
