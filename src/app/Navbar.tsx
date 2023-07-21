"use client";

import { ConnectWallet } from "@thirdweb-dev/react";

export default function Navbar() {
  return (
    <nav className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-5 lg:dark:bg-zinc-700/30">
        Rock Paper Scissors Lizard Spock
      </p>
      <div className="fixed top-24 left-0 flex h-auto w-full items-end justify-center lg:static lg:h-auto lg:w-auto lg:bg-none">
        <ConnectWallet />
      </div>
    </nav>
  );
}
