"use client";

import { useAddress } from "@thirdweb-dev/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { isValidAddress } from "ethereumjs-util";

enum Move {
  rock = "Rock",
  paper = "Paper",
  scissors = "Scissors",
  lizard = "Lizard",
  spock = "Spock",
}

type Inputs = {
  address: string;
  move: Move;
  stake: number;
};

export default function Home() {
  const ownAddress = useAddress();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm<Inputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { address: "", move: Move.rock, stake: 0.01 },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log("submit:", data);
  };

  return (
    <section className="h-full flex flex-col flex-1 justify-center w-[512px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-10">
          <label
            htmlFor="address"
            className={`block mb-2 text-sm font-medium ${
              errors.address ? "text-red-700" : "text-white"
            }`}
          >
            Opponent&apos;s address
          </label>
          <input
            id="address"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-800 placeholder-gray-400 text-white focus:ring-gray-500 focus:border-gray-500"
            {...register("address", {
              required: {
                value: true,
                message: "Opponent's address is required.",
              },
              validate: (value) =>
                isValidAddress(value) && ownAddress !== value,
            })}
            aria-invalid={!!errors.address}
          />
          {errors.address && (
            <p className="mt-2 text-sm text-red-600 absolute">
              {errors.address.message || "Invalid or own address."}
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
            {Object.values(Move).map((move) => (
              <option key={move} value={move}>
                {move}
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
            aria-invalid={!!errors.address}
          />
          {errors.stake && (
            <p className="mt-2 text-sm text-red-600 absolute">
              {errors.stake.message}
            </p>
          )}
        </div>
        <button className="w-full rounded-lg bg-gray-800 p-4 hover:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-800">
          Create game
        </button>
      </form>
    </section>
  );
}
