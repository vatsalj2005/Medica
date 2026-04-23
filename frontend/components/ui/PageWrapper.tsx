"use client";
import { ReactNode } from "react";

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="page-enter p-8 space-y-8 min-h-full">
      {children}
    </div>
  );
}
