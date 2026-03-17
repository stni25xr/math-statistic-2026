"use client";

import { ReactNode } from "react";
import { AccessibilityProvider } from "@/components/accessibility-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { LanguageSwitcherEdge } from "@/components/language-switcher-edge";
import { ProgressProvider } from "@/components/progress-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AccessibilityProvider>
        <ProgressProvider>
          {children}
          <LanguageSwitcherEdge />
        </ProgressProvider>
      </AccessibilityProvider>
    </I18nProvider>
  );
}
