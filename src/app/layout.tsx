"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { Sepolia } from "@thirdweb-dev/chains";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Navbar from "@/app/Navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider theme="dark" activeChain={Sepolia}>
          <main className="flex min-h-screen flex-col items-center p-24">
            <Navbar />
            {children}
          </main>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
