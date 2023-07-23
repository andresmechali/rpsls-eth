import { useEffect, useState } from "react";
import { Address } from "viem";
import { useParams } from "next/navigation";
import { useAddress } from "@thirdweb-dev/react";
import { publicClient, walletClient } from "@/utils";
import rpsContract from "@/contracts/RPS.json";

export default function Player1Screen() {
  const [player2Move, setPlayer2Move] = useState<number>();
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const ownAddress = useAddress();
  const { gameId } = useParams();

  useEffect(() => {
    // TODO: turn into hook
    (async () => {
      if (gameId) {
        const c2 = (await publicClient.readContract({
          address: gameId as Address,
          abi: rpsContract.abi,
          functionName: "c2",
        })) as number;
        if (c2) {
          setPlayer2Move(c2);
        }
      }
    })();
  }, [gameId]);

  const onSolve = async () => {
    console.log("SOLVE");
    setIsSolving(true);
    try {
      const [account] = await walletClient.getAddresses();

      if (ownAddress) {
        const { request } = await publicClient.simulateContract({
          address: gameId as Address,
          abi: rpsContract.abi,
          functionName: "solve",
          account,
          args: [1, BigInt(123)], // TODO: set proper move and salt
        });

        const txHash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        console.log("-----RES-------");
        console.log({ receipt });
      }
    } catch (e) {
      console.log(e);
      // TODO: handle error
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <section className="h-full flex flex-col justify-center w-[512px]">
      {!player2Move ? (
        <p>Waiting for player 2</p>
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
