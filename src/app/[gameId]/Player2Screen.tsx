import { useEffect, useState } from "react";
import { Address, parseEther } from "viem";
import { useParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAddress } from "@thirdweb-dev/react";
import { Move, MoveOptions } from "@/types";
import { publicClient, walletClient } from "@/utils";
import rpsContract from "@/contracts/RPS.json";

type Inputs = {
  move: MoveOptions;
};

export default function Player2Screen({ stake }: { stake: number }) {
  const [playerMove, setPlayerMove] = useState<number>();
  const ownAddress = useAddress();
  const { gameId } = useParams();

  useEffect(() => {
    (async () => {
      if (gameId) {
        const c2 = (await publicClient.readContract({
          address: gameId as Address,
          abi: rpsContract.abi,
          functionName: "c2",
        })) as number;
        if (c2) {
          setPlayerMove(c2);
        }
      }
    })();
  }, [gameId]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Inputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      move: 0,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log("SUBMIT");
    try {
      const { move } = data;
      const [account] = await walletClient.getAddresses();

      if (ownAddress) {
        const { request } = await publicClient.simulateContract({
          address: gameId as `0x${string}`,
          abi: rpsContract.abi,
          functionName: "play",
          account,
          args: [move],
          value: parseEther(stake.toString(10)),
        });

        const txHash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        setPlayerMove(move);

        console.log("-----RES-------");
        console.log({ receipt });
      }
    } catch (e) {
      console.log(e);
      // TODO: handle error
    }
  };

  if (playerMove) {
    return (
      <div>
        You already chose{" "}
        <kbd className="px-2 py-1.5 text-xs font-semibold border rounded-lg bg-gray-600 text-gray-100 border-gray-500">
          {Object.keys(Move)[playerMove - 1]}
        </kbd>
        . Waiting for player 1 to finish the game.
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col justify-center w-[512px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-10">
          <label
            htmlFor="move"
            className={`block mb-2 text-sm font-medium ${
              errors.move ? "text-red-700" : "text-white"
            }`}
          >
            Move
          </label>
          <select
            id="move"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-800 placeholder-gray-400 text-white focus:ring-gray-500 focus:border-gray-500"
            {...register("move", {
              required: {
                value: true,
                message: "Move is required.",
              },
            })}
            aria-invalid={!!errors.move}
          >
            {Object.values(Move).map((label, idx) => (
              <option key={label} value={idx + 1}>
                {label}
              </option>
            ))}
          </select>
          {errors.move && (
            <p className="mt-2 text-sm text-red-600 absolute">
              {errors.move.message || "Invalid move."}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-gray-800 p-4 hover:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Playing..." : `Play ${stake} ETH`}
        </button>
      </form>
    </section>
  );
}
