import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Math Statistics Exam Trainer",
  description:
    "Train by topic, learn formulas, and see every step for Mathematical Statistics exam prep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
