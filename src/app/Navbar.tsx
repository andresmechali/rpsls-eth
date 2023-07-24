"use client";

import { ConnectWallet } from "@thirdweb-dev/react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export default function Navbar() {
  return (
    <nav className="z-10 w-full">
      <Link
        href="/"
        className="w-full items-center justify-between font-mono text-sm lg:flex cursor-pointer"
      >
        <p className="fixed left-0 top-0 flex w-full justify-center border-b bg-gradient-to-b pb-6 pt-8 backdrop-blur-2xl border-neutral-800 bg-zinc-800/30 from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-5 lg:bg-zinc-700/30">
          Rock Paper Scissors Lizard Spock
        </p>
        <Toaster />
        <div className="fixed top-16 flex h-auto w-full items-end justify-center lg:static lg:h-auto lg:w-auto lg:bg-none">
          <ConnectWallet />
        </div>
      </Link>
    </nav>
  );
}
