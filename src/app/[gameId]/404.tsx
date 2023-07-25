"use client";

import { Address } from "viem";
import { useRouter } from "next/navigation";

export default function Game404({ gameId }: { gameId: Address }) {
  const router = useRouter();
  return (
    <div className="w-full h-full flex justify-center items-center flex-1">
      <div className="flex flex-col gap-4 items-center">
        <p>Game {gameId} does not exist.</p>
        <button
          className="rounded-md bg-gray-800/50 hover:bg-gray-700/50 p-4"
          onClick={async () => {
            router.push("/");
          }}
        >
          Start new game
        </button>
      </div>
    </div>
  );
}
