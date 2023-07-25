"use client";

import { useAddress } from "@thirdweb-dev/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { isValidAddress } from "ethereumjs-util";
import { useRouter } from "next/navigation";
import { generateSalt, publicClient, storeSaltAndMove } from "@/utils";
import { Move, MoveOption } from "@/types";
import toast from "react-hot-toast";
import {
  Address,
  createWalletClient,
  custom,
  encodePacked,
  Hex,
  keccak256,
  parseEther,
} from "viem";
import { sepolia } from "viem/chains";
import rpsContract from "@/contracts/RPS.json";
import useIsWrongChain from "@/app/hooks/useIsWrongChain";

type Inputs = {
  opponent: string;
  move: MoveOption;
  stake: number;
};

export default function Home() {
  const ownAddress = useAddress();
  const router = useRouter();
  const isWrongChain = useIsWrongChain();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Inputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      opponent: "",
      move: 0,
      stake: 0,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    // Create game
    try {
      const { opponent, stake, move } = data;

      if (ownAddress) {
        // Generate salt.
        const salt = generateSalt();
        // Encrypt salt and move and store locally.
        await storeSaltAndMove(ownAddress as Address, salt, move);
        // Generate c1Hash
        const hash: Hex = keccak256(
          encodePacked(["uint8", "uint256"], [move, salt]),
        ) as Hex;
        // Generate wallet client
        const walletClient = createWalletClient({
          chain: sepolia,
          transport: custom(window.ethereum),
        });
        // Deploy contract
        const txHash = await walletClient.deployContract({
          abi: rpsContract.abi,
          bytecode: rpsContract.bytecode as Address,
          account: ownAddress as Address,
          args: [hash, opponent as Address],
          value: parseEther(stake.toString()),
        });
        // Wait for transaction to be confirmed
        const { contractAddress } =
          await publicClient.waitForTransactionReceipt({
            hash: txHash,
          });

        toast.success("Game created successfully!");

        // Redirect to game page
        router.push(`/${contractAddress}`);
      }
    } catch (e) {
      console.log(e);
      toast.error("Error creating game.");
    }
  };

  if (isWrongChain) {
    return (
      <div className="w-full h-full flex justify-center items-center flex-1">
        Please switch to Sepolia
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col flex-1 justify-center w-[512px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-10">
          <label
            htmlFor="opponent"
            className={`block mb-2 text-sm font-medium ${
              errors.opponent ? "text-red-700" : "text-white"
            }`}
          >
            Opponent&apos;s address
          </label>
          <input
            id="address"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-800 placeholder-gray-400 text-white focus:ring-gray-500 focus:border-gray-500"
            {...register("opponent", {
              required: {
                value: true,
                message: "Opponent's address is required.",
              },
              validate: (value) =>
                isValidAddress(value) && ownAddress !== value,
            })}
            aria-invalid={!!errors.opponent}
          />
          {errors.opponent && (
            <p className="mt-2 text-sm text-red-600 absolute">
              {errors.opponent.message || "Invalid or own address."}
            </p>
          )}
        </div>
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
        <div className="mb-14">
          <label
            htmlFor="stake"
            className={`block mb-2 text-sm font-medium ${
              errors.stake ? "text-red-700" : "text-white"
            }`}
          >
            Stake (ETH)
          </label>
          <input
            id="stake"
            type="number"
            step={0.001}
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-800 placeholder-gray-400 text-white focus:ring-gray-500 focus:border-gray-500"
            {...register("stake", {
              required: {
                value: true,
                message: "Stake amount is required.",
              },
              min: 0.001,
              max: 10,
            })}
            aria-invalid={!!errors.stake}
          />
          {errors.stake && (
            <p className="mt-2 text-sm text-red-600 absolute">
              {errors.stake.message}
            </p>
          )}
        </div>
        <button
          className="w-full rounded-lg bg-gray-800 p-4 hover:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create game"}
        </button>
      </form>
    </section>
  );
}
