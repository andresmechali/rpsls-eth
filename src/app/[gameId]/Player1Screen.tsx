"use client";

import { useState } from "react";
import { Address, createWalletClient, custom } from "viem";
import { useParams } from "next/navigation";
import { useAddress } from "@thirdweb-dev/react";
import {
  getContractData,
  getStoredSaltAndMove,
  getWinner,
  publicClient,
} from "@/utils";
import rpsContract from "@/contracts/RPS.json";
import toast from "react-hot-toast";
import { useContract } from "@/state/contractContext";
import { sepolia } from "viem/chains";
import { MoveOption } from "@/types";

export default function Player1Screen() {
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const ownAddress = useAddress();
  const { gameId } = useParams();
  const {
    contractData: { c2, stake },
    setContractData,
  } = useContract();

  const onSolve = async () => {
    setIsSolving(true);
    try {
      if (ownAddress) {
        // Retrieve salt and move from sessionStorage. These are stored encrypted.
        const { salt, move } = await getStoredSaltAndMove(
          ownAddress as Address,
        );

        const { request } = await publicClient.simulateContract({
          address: gameId as Address,
          abi: rpsContract.abi,
          functionName: "solve",
          account: ownAddress as Address,
          args: [Number(move), BigInt(salt)],
        });

        const walletClient = createWalletClient({
          chain: sepolia,
          transport: custom(window.ethereum),
        });

        const txHash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (receipt.status === "success") {
          const winner = getWinner(move as MoveOption, c2 as MoveOption);
          // Safety: stake will always be defined at this stage.
          let toastMessage = `The game was tied! You are getting back your ${stake} ETH.`;
          let icon = "😐";
          if (winner === 1) {
            toastMessage = `Congratulations! You have won the game and will receive ${
              2 * stake!
            } ETH.`;
            icon = "👏";
          } else if (winner === 2) {
            toastMessage = `Oops! Unfortunately you have lost the game. Your ${stake} ETH will go to player 2.`;
            icon = "😰";
          }

          toast.success(toastMessage, { duration: 5000, icon });

          // Get recent data and update context
          const newContractData = await getContractData(gameId as Address);
          setContractData((prevData) => ({
            ...prevData,
            ...newContractData,
          }));
        } else {
          toast.error("There was an error solving the game.");
        }
      }
    } catch (e) {
      console.log(e);
      toast.error("There was an error solving the game.");
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <section className="h-full flex flex-col gap-4 justify-center w-[512px]">
      {!c2 ? (
        <p className="text-center">
          You have already picked. Waiting for player 2.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <p>
            Player 2 has already played. Please finish the game before the time
            runs out.
          </p>
          <button
            type="submit"
            onClick={onSolve}
            className="w-full rounded-lg bg-gray-800 p-4 hover:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
            disabled={isSolving}
          >
            {isSolving ? "Solving..." : `Solve`}
          </button>
        </div>
      )}
    </section>
  );
}
