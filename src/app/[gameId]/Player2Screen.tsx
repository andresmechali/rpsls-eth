import { Address, parseEther } from "viem";
import { useParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { Badge } from "flowbite-react";
import toast from "react-hot-toast";
import { useAddress } from "@thirdweb-dev/react";
import { Move, MoveOptions } from "@/types";
import { getContractData, publicClient, walletClient } from "@/utils";
import rpsContract from "@/contracts/RPS.json";
import { useContract } from "@/state/contractContext";

type Inputs = {
  move: MoveOptions;
};

export default function Player2Screen() {
  const ownAddress = useAddress();
  const { gameId } = useParams();
  const {
    contractData: { c2, stake },
    setContractData,
  } = useContract();

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
    try {
      const { move } = data;

      if (ownAddress) {
        const { request } = await publicClient.simulateContract({
          address: gameId as Address,
          abi: rpsContract.abi,
          functionName: "play",
          account: ownAddress as Address,
          args: [move],
          // Safety: This component will never render if there is no stake (as per GameScreen logic)
          value: parseEther(stake!.toString(10)),
        });

        const txHash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (receipt.status === "success") {
          toast.success(
            `You have successfully picked ${Object.keys(Move)[move - 1]}.`,
          );

          // Get recent data and update context
          const newContractData = await getContractData(gameId as Address);
          setContractData((prevData) => ({
            ...prevData,
            ...newContractData,
          }));
        } else {
          toast.error("There was an error submitting your move.");
        }
      }
    } catch (e) {
      console.log(e);
      toast.error("There was an error submitting your move.");
    }
  };

  if (c2) {
    return (
      <div className="flex flex-row gap-1 items-center">
        <p>You have already picked</p>
        <span>
          <Badge className="uppercase" color="purple" size="xl">
            {Object.keys(Move)[c2 - 1]}
          </Badge>
        </span>
        <p>. Waiting for player 1 to finish the game.</p>
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
          {isSubmitting ? "Playing..." : `Play (${stake} ETH)`}
        </button>
      </form>
    </section>
  );
}
