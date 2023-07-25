"use client";

import { useEffect, useState } from "react";
import { useAddress, useChain } from "@thirdweb-dev/react";
import { getContractData, publicClient } from "@/utils";
import rpsContract from "@/contracts/RPS.json";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Badge, Spinner } from "flowbite-react";
import GameScreen from "@/app/[gameId]/GameScreen";
import { useContract } from "@/state/contractContext";
import { Address, createWalletClient, custom } from "viem";
import toast from "react-hot-toast";
import Game404 from "@/app/[gameId]/404";
import { sepolia } from "viem/chains";
import { useTimeLeft } from "@/app/hooks/useTimeLeft";

type Props = {
  params: {
    gameId: Address;
  };
};

export default function GamePage({ params: { gameId } }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isClaimingTimeout, setIsClaimingTimeout] = useState<boolean>(false);
  const [isWrongChain, setIsWrongChain] = useState<boolean>(false);
  const {
    contractData: { stake, j1, j2, lastAction, c2 },
    setContractData,
  } = useContract();
  const { secondsLeft, minutesLeft, msLeft } = useTimeLeft(lastAction);
  const chain = useChain();

  const ownAddress = useAddress();

  const player = ownAddress === j1 ? 1 : ownAddress === j2 ? 2 : undefined;

  useEffect(() => {
    if (chain) {
      setIsWrongChain(chain.name !== "Sepolia");
    }
  }, [chain]);

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
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [gameId, setContractData]);

  const claimTimeout = async () => {
    const walletClient = createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    });
    const [account] = await walletClient.getAddresses();
    try {
      setIsClaimingTimeout(true);
      if ((player === 1 || player === 2) && stake) {
        const { request } = await publicClient.simulateContract({
          address: gameId,
          abi: rpsContract.abi,
          functionName: player === 1 ? "j2Timeout" : "j1Timeout",
          account,
        });

        const txHash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (receipt.status === "success") {
          if (player === 2) {
            // If j2 claimed timeout successfully, j2 will be the winner, receiving 2*stake
            toast.success(
              `Contratulations! You have won the game and will receive ${
                2 * stake
              } ETH.`,
            );
          } else {
            // If j1 claimed timeout successfully, there will be no winner, as j2 has not staked any ETH yet
            toast.success(
              `Player 2 has timed out. You are getting back your ${stake} ETH.`,
            );
          }

          // Get new contract data and update state
          const newContractData = await getContractData(gameId as Address);
          setContractData((prevData) => ({
            ...prevData,
            ...newContractData,
          }));
        } else {
          toast.error("There has been an error claiming the timeout.");
        }
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
    return <Game404 gameId={gameId} />;
  }

  if (isWrongChain) {
    return (
      <div className="w-full h-full flex justify-center items-center flex-1">
        Please switch to Sepolia
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col justify-between flex-1">
      {/* Game information */}
      {stake && stake !== 0 ? (
        <header className="flex flex-row justify-between items-center mt-16">
          <CircularProgressbarWithChildren
            value={msLeft ? (msLeft / (5 * 60 * 1_000)) * 100 : 100}
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
          <p className="flex flex-row gap-2 items-center">
            {c2 ? "PRIZE" : "STAKE"}
            <Badge color="green" size="xl">
              {(c2 ? 2 : 1) * stake}
            </Badge>
            ETH
          </p>
        </header>
      ) : null}

      <main className="flex flex-1 items-center justify-center w-[512px]">
        <GameScreen player={player} />
      </main>
    </section>
  );
}
