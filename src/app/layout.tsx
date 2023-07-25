"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { Sepolia } from "@thirdweb-dev/chains";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Navbar from "@/app/Navbar";
import { ContractProvider } from "@/state/contractContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider
          theme="dark"
          activeChain={Sepolia}
          clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        >
          <ContractProvider>
            <main className="flex min-h-screen flex-col items-center p-16 max-w-[1500px] ml-auto mr-auto">
              <Navbar />
              {children}
            </main>
          </ContractProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
