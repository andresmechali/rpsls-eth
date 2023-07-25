"use client";

import { ConnectWallet } from "@thirdweb-dev/react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { Badge, Tooltip } from "flowbite-react";
import { HiQuestionMarkCircle } from "react-icons/hi";
import dynamic from "next/dynamic";

const NonSSRTooltip = dynamic(() => Promise.resolve(Tooltip), { ssr: false });

export default function Navbar() {
  return (
    <nav className="z-10 w-full flex flex-row">
      <div className="flex flex-row gap-2 flex-start items-center">
        <Link href="/" className="font-mono text-sm lg:flex cursor-pointer">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b bg-gradient-to-b pb-6 pt-8 backdrop-blur-2xl border-neutral-800 bg-zinc-800/30 from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-5 lg:bg-zinc-700/30">
            Rock Paper Scissors Lizard Spock
          </p>
        </Link>
        <NonSSRTooltip
          content={
            <div>
              <p>Scissors cuts Paper</p>
              <p>Paper covers Rock</p>
              <p>Rock crushes Lizard</p>
              <p>Lizard poisons Spock</p>
              <p>Spock smashes Scissors</p>
              <p>Scissors decapitates Lizard</p>
              <p>Lizard eats Paper</p>
              <p>Paper disproves Spock</p>
              <p>Spock vaporizes Rock</p>
              <p>(and as it always has) Rock crushes Scissors</p>
            </div>
          }
        >
          <Badge icon={HiQuestionMarkCircle} size="xs">
            HOW TO PLAY
          </Badge>
        </NonSSRTooltip>
      </div>

      <div className="fixed top-16 flex h-auto items-end lg:static w-full bg-none flex-row justify-end flex-1">
        <ConnectWallet />
      </div>
      <Toaster
        toastOptions={{
          duration: 5000,
        }}
      />
    </nav>
  );
}
