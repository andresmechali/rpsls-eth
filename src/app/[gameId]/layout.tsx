import { ReactNode } from "react";
import Footer from "@/app/[gameId]/Footer";

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col items-center justify-between flex-1 mt-32">
      {children}
      <Footer />
    </section>
  );
}
