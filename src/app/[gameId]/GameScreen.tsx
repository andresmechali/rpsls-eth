"use client";

import { useRouter } from "next/navigation";
import Player2Screen from "@/app/[gameId]/Player2Screen";
import Player1Screen from "@/app/[gameId]/Player1Screen";
import { useContract } from "@/state/contractContext";

export default function GameScreen({ player }: { player: 1 | 2 | undefined }) {
  const router = useRouter();
  const {
    contractData: { stake },
  } = useContract();

  if (!stake) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p>Game finished. TODO: show winner.</p>
        <button
          className="rounded-md bg-gray-800/50 hover:bg-gray-700/50 p-4"
          onClick={() => {
            router.push("/");
          }}
        >
          Start new game
        </button>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p>You are not part of this game.</p>
        <button
          className="rounded-md bg-gray-800/50 hover:bg-gray-700/50 p-4"
          onClick={() => {
            router.push("/");
          }}
        >
          Start new game
        </button>
      </div>
    );
  }

  if (player === 1) {
    return <Player1Screen />;
  }

  return <Player2Screen />;
}
