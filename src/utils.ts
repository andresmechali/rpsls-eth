"use client";

import { Address, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import rpsContract from "./contracts/RPS.json";
import { ContractData, MoveOption, Player } from "@/types";
import { randomBytes } from "crypto";
import { encrypt, EthEncryptedData } from "@metamask/eth-sig-util";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(
    `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
  ),
  // transport: http(),
});

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
  move: MoveOption,
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

export function getWinner(move1: MoveOption, move2: MoveOption): Player {
  if (move1 === 0 || move2 === 0) return;
  if (move1 === move2) return;
  if (move1 % 2 === move2 % 2) {
    return move1 < move2 ? 1 : 2;
  }
  return move1 > move2 ? 2 : 1;
}
