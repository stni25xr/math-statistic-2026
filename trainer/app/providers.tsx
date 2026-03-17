"use client";

import { ReactNode } from "react";
import { ProgressProvider } from "@/components/progress-provider";

export function Providers({ children }: { children: ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}
