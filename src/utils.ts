"use client";

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
import { ContractData, MoveOptions } from "@/types";
import { randomBytes } from "crypto";
import { encrypt, EthEncryptedData } from "@metamask/eth-sig-util";

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
  try {
    // Generate salt.
    const salt = await generateSalt();
    // Encrypt salt and move and store locally.
    await storeSaltAndMove(ownAddress as Address, salt, move);
    // Generate c1Hash
    const hash: Hex = keccak256(
      encodePacked(["uint8", "uint256"], [move, salt]),
    ) as Hex;

    const txHash = await walletClient.deployContract({
      abi: rpsContract.abi,
      bytecode: rpsContract.bytecode as Address,
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

/**
 * Generates random bigint to be used as salt.
 */
export function generateSalt() {
  return BigInt(`0x${randomBytes(32).toString("hex")}`);
}

/**
 * Encrypts salt and move using MetaMask, and stores encrypted values on sessionStorage.
 * @param address
 * @param salt
 * @param move
 */
export async function storeSaltAndMove(
  address: Address,
  salt: bigint,
  move: MoveOptions,
) {
  try {
    // Get encryption public key.
    const keyB64 = (await window.ethereum.request({
      method: "eth_getEncryptionPublicKey",
      params: [address],
    })) as string;

    const publicKey = Buffer.from(keyB64, "base64");

    // Encrypt salt and move.
    const encryptedSaltAndMove = encrypt({
      publicKey: publicKey.toString("base64"),
      data: JSON.stringify({
        salt: salt.toString(10),
        move: move.toString(10),
      }),
      version: "x25519-xsalsa20-poly1305",
    });

    // Store encrypted salt and move in session storage. This is cleared when the browser is closed.
    sessionStorage.setItem(address, JSON.stringify(encryptedSaltAndMove));
  } catch (e) {
    console.log(e);
    throw e;
  }
}

/**
 * Fetches encrypted salt and move from sessionStorage, and decrypts them using MetaMask.
 * @param address
 */
export async function getStoredSaltAndMove(address: Address) {
  try {
    // Get stored encrypted salt and move.
    const encryptedSaltAndMove = sessionStorage.getItem(address);

    if (!encryptedSaltAndMove) {
      throw new Error(
        "There is no previous salt and move stored locally. Maybe you have changed to a different browser window.",
      );
    }

    const parsedSaltAndMove: EthEncryptedData =
      JSON.parse(encryptedSaltAndMove);

    // Convert data to hex string, as required by MetaMask.
    const ct = `0x${Buffer.from(
      JSON.stringify(parsedSaltAndMove),
      "utf8",
    ).toString("hex")}`;

    // Decrypt data.
    const decryptedSaltAndMove: { salt: string; move: string } = JSON.parse(
      await window.ethereum.request({
        method: "eth_decrypt",
        params: [ct, address],
      }),
    );

    return {
      salt: BigInt(decryptedSaltAndMove.salt),
      move: Number(decryptedSaltAndMove.move),
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// TODO: move to hooks folder
/**
 * Starts a timer from lastAction, and returns the minutes, seconds and milliseconds left.
 * The seconds correspond to how many seconds are left given the current minutes, while the milliseconds
 * correspond to the total amount.
 * @param lastAction
 */
export function useTimeLeft(lastAction?: number) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [minutesLeft, setMinutesLeft] = useState<number>(0);
  const [msLeft, setMsLeft] = useState<number>();

  const totalMinutes = 5;

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

/**
 * Fetches relevant data stored on the contract corresponding to the provided address.
 * @param contractAddress
 */
export async function getContractData(
  contractAddress: Address,
): Promise<Partial<ContractData>> {
  // @ts-ignore
  const values = await Promise.all<[Address, Address, number, number, number]>([
    publicClient.readContract({
      address: contractAddress,
      abi: rpsContract.abi,
      functionName: "j1",
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: rpsContract.abi,
      functionName: "j2",
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: rpsContract.abi,
      functionName: "c2",
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: rpsContract.abi,
      functionName: "stake",
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: rpsContract.abi,
      functionName: "lastAction",
    }),
  ]);

  return {
    j1: values[0],
    j2: values[1],
    c2: values[2],
    stake: Number(values[3]) / 1e18,
    lastAction: Number(values[4]) * 1_000,
  };
}
