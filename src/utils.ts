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
  move: string;
  stake: string;
}) {
  const salt = BigInt(123); // TODO: make it random
  const hash: Hex = keccak256(
    encodePacked(["uint8", "uint256"], [1, salt]), // TODO: get proper move
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
