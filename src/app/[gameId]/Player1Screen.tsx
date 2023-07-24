import { useState } from "react";
import { Address } from "viem";
import { useParams } from "next/navigation";
import { metamaskWallet, useAddress, useMetamask } from "@thirdweb-dev/react";
import { getContractData, publicClient, walletClient } from "@/utils";
import rpsContract from "@/contracts/RPS.json";
import toast from "react-hot-toast";
import { useContract } from "@/state/contractContext";

// const metamaskConfig = metamaskWallet();

export default function Player1Screen() {
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const ownAddress = useAddress();
  const { gameId } = useParams();
  const {
    contractData: { c2 },
    setContractData,
  } = useContract();

  const onSolve = async () => {
    setIsSolving(true);
    try {
      if (ownAddress) {
        // Retrieve salt and move from sessionStorage
        const salt = sessionStorage.getItem(`salt-${ownAddress}`);
        const move = sessionStorage.getItem(`move-${ownAddress}`);

        if (!salt || !move) {
          throw new Error("Salt or move are missing on sessionStorage");
        }

        const { request } = await publicClient.simulateContract({
          address: gameId as Address,
          abi: rpsContract.abi,
          functionName: "solve",
          account: ownAddress as Address,
          args: [Number(move), BigInt(salt)],
        });

        const txHash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (receipt.status === "success") {
          toast.success("Game finished successfully!");
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
      // TODO: handle error
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <section className="h-full flex flex-col gap-4 justify-center w-[512px]">
      Player 2 has already played. Please finish the game before the time runs
      out.
      {!c2 ? (
        <p className="text-center">Waiting for player 2</p>
      ) : (
        <button
          type="submit"
          onClick={onSolve}
          className="w-full rounded-lg bg-gray-800 p-4 hover:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
          disabled={isSolving}
        >
          {isSolving ? "Solving..." : `Solve`}
        </button>
      )}
    </section>
  );
}
