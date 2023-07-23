import { useRouter } from "next/navigation";
import Player2Screen from "@/app/[gameId]/Player2Screen";
import Player1Screen from "@/app/[gameId]/Player1Screen";

export default function GameScreen({
  player,
  stake,
}: {
  player: 1 | 2 | undefined;
  stake?: number;
}) {
  const router = useRouter();

  if (!stake) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p>Game finished</p>
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
    return <p>You are not part of this game</p>;
  }

  if (player === 1) {
    return <Player1Screen />;
    return <p>Waiting for player 2...</p>;
  }

  // TODO
  return <Player2Screen stake={stake} />;
}
