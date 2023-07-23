"use client";

import { useEffect, useState } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { publicClient, useTimeLeft, walletClient } from "@/utils";
import rpsContract from "@/contracts/RPS.json";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";
import GameScreen from "@/app/[gameId]/GameScreen";

type Props = {
  params: {
    gameId: `0x${string}`;
  };
};

export default function GamePage({ params: { gameId } }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [player1, setPlayer1] = useState<`0x${string}`>();
  const [player2, setPlayer2] = useState<`0x${string}`>();
  const [stake, setStake] = useState<number>();
  const [lastAction, setLastAction] = useState<number>(new Date().getTime());
  const [hasError, setHasError] = useState<boolean>(false);
  const [isClaimingTimeout, setIsClaimingTimeout] = useState<boolean>(false);
  const timeout = 5;
  const { secondsLeft, minutesLeft, msLeft } = useTimeLeft(lastAction, timeout); // TODO: remove timeout or set to 5

  const ownAddress = useAddress();
  const router = useRouter();

  const player =
    ownAddress === player1 ? 1 : ownAddress === player2 ? 2 : undefined;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        if (gameId) {
          const j1 = (await publicClient.readContract({
            address: gameId,
            abi: rpsContract.abi,
            functionName: "j1",
          })) as `0x${string}`;
          const j2 = (await publicClient.readContract({
            address: gameId,
            abi: rpsContract.abi,
            functionName: "j2",
          })) as `0x${string}`;
          const contractStake = (await publicClient.readContract({
            address: gameId,
            abi: rpsContract.abi,
            functionName: "stake",
          })) as number;
          const contractLastAction = (await publicClient.readContract({
            address: gameId,
            abi: rpsContract.abi,
            functionName: "lastAction",
          })) as number;
          if (j1 && j2 && contractStake && contractLastAction) {
            setPlayer1(j1);
            setPlayer2(j2);
            setStake(Number(contractStake) / 1e18);
            setLastAction(Number(contractLastAction) * 1000);
          }
        }
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [gameId]);

  const claimTimeout = async () => {
    const [account] = await walletClient.getAddresses();
    console.log({ account });
    // TODO: simulateContract
    try {
      setIsClaimingTimeout(true);
      if (player === 1 || player === 2) {
        const { request } = await publicClient.simulateContract({
          address: gameId,
          abi: rpsContract.abi,
          functionName: player === 1 ? "j2Timeout" : "j1Timeout",
          account,
        });

        await walletClient.writeContract(request);
      } else {
        // TODO: what?
      }
    } catch (e) {
      // TODO: handle error with toaster
    } finally {
      setIsClaimingTimeout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center flex-1">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col justify-between flex-1">
      {/* Game information */}
      {stake && (
        <header className="flex flex-row justify-between items-center mt-16">
          <CircularProgressbarWithChildren
            value={(msLeft / (timeout * 60 * 1_000)) * 100}
            className="h-[100px]"
          >
            {isClaimingTimeout ? (
              <Spinner />
            ) : msLeft > 0 ? (
              <h1 className="text-xl">
                {minutesLeft}m {secondsLeft}
              </h1>
            ) : (
              <button
                className="h-full w-full rounded-full hover:scale-110 duration-100"
                onClick={claimTimeout}
              >
                Claim timeout
              </button>
            )}
          </CircularProgressbarWithChildren>
          <p>Stake: {stake} ETH</p>
        </header>
      )}

      <main className="flex flex-1 items-center justify-center">
        <GameScreen player={player} stake={stake} />
      </main>
    </section>
  );
}
