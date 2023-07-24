"use client";

import { useEffect, useState } from "react";
import { useAddress } from "@thirdweb-dev/react";
import {
  getContractData,
  publicClient,
  useTimeLeft,
  walletClient,
} from "@/utils";
import rpsContract from "@/contracts/RPS.json";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Spinner } from "flowbite-react";
import GameScreen from "@/app/[gameId]/GameScreen";
import { useContract } from "@/state/contractContext";
import { Address } from "viem";
import toast from "react-hot-toast";

type Props = {
  params: {
    gameId: `0x${string}`;
  };
};

export default function GamePage({ params: { gameId } }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isClaimingTimeout, setIsClaimingTimeout] = useState<boolean>(false);
  const timeout = 10;
  const {
    contractData: { stake, j1, j2, lastAction },
    setContractData,
  } = useContract();
  const { secondsLeft, minutesLeft, msLeft } = useTimeLeft(lastAction, timeout); // TODO: remove timeout or set to 5

  const ownAddress = useAddress();

  const player = ownAddress === j1 ? 1 : ownAddress === j2 ? 2 : undefined;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        if (gameId) {
          const newContractData = await getContractData(gameId as Address);
          setContractData((prevData) => ({
            ...prevData,
            ...newContractData,
          }));
        }
      } catch (e) {
        // TODO: toaster
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [gameId, setContractData]);

  const claimTimeout = async () => {
    const [account] = await walletClient.getAddresses();
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
        toast.error("You are not allowed to claim a timeout.");
      }
    } catch (e) {
      toast.error("There has been an error claiming timeout.");
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

  if (hasError) {
    return (
      <div className="w-full h-full flex justify-center items-center flex-1">
        Error loading game. TODO: show nice UI.
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col justify-between flex-1">
      {/* Game information */}
      {stake && stake !== 0 ? (
        <header className="flex flex-row justify-between items-center mt-16">
          <CircularProgressbarWithChildren
            value={msLeft ? (msLeft / (timeout * 60 * 1_000)) * 100 : 100}
            className="h-[100px]"
          >
            {isClaimingTimeout || msLeft === undefined ? (
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
          <p>Stake: {stake} ETH TODO: show nice UI</p>
        </header>
      ) : null}

      <main className="flex flex-1 items-center justify-center">
        <GameScreen player={player} />
      </main>
    </section>
  );
}
