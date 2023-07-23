import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  encodePacked,
  Hex,
  http,
  keccak256,
  parseEther,
} from "viem";
import { sepolia } from "viem/chains";
import rpsContract from "./contracts/RPS.json";
import { useEffect, useState } from "react";
import { MoveOptions } from "@/types";

export const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum),
});

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(
    `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
  ),
  // transport: http(),
});

export async function createGame({
  ownAddress,
  opponent,
  move,
  stake,
}: {
  ownAddress: string;
  opponent: string;
  move: MoveOptions;
  stake: string;
}) {
  const salt = BigInt(123); // TODO: make it random
  const hash: Hex = keccak256(
    encodePacked(["uint8", "uint256"], [move, salt]),
  ) as Hex;

  console.log("create game");

  try {
    const txHash = await walletClient.deployContract({
      abi: rpsContract.abi,
      bytecode: rpsContract.bytecode as `0x{string}`,
      // ...rpsContract,
      account: ownAddress as Address,
      args: [hash, opponent as Address],
      value: parseEther(stake),
    });

    const { contractAddress } = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return contractAddress;
  } catch (e) {
    console.log("ERROR!");
    throw e;
  }
}

export function useTimeLeft(lastAction?: number, totalMins?: number) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [minutesLeft, setMinutesLeft] = useState<number>(0);
  const [msLeft, setMsLeft] = useState<number>(0);

  const defaultTotalMinutes: number = 5;
  const totalMinutes = totalMins || defaultTotalMinutes;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lastAction) {
        const last = new Date(lastAction);
        const expiry = new Date(
          last.setSeconds(last.getSeconds() + totalMinutes * 60),
        );
        const now = new Date();
        const missing = expiry.getTime() - now.getTime();
        const seconds = Math.floor((missing / 1_000) % 60);
        const minutes = Math.floor((missing / (60 * 1_000)) % totalMinutes);
        setSecondsLeft(seconds > 0 ? seconds : 0);
        setMinutesLeft(minutes > 0 ? minutes : 0);
        setMsLeft(missing > 0 ? missing : 0);
      }
    }, 1_000);

    return () => clearTimeout(timer);
  });

  return { secondsLeft, minutesLeft, msLeft };
}
