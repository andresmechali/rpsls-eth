"use client";

import { ReactNode } from "react";

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col items-center justify-between flex-1">
      {children}
    </section>
  );
}
