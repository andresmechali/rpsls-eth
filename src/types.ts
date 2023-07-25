import { Address } from "viem";

declare module RPSTypes {}

export type MoveOption = 0 | 1 | 2 | 3 | 4 | 5;

export enum Move {
  Rock = "Rock",
  Paper = "Paper",
  Scissors = "Scissors",
  Lizard = "Lizard",
  Spock = "Spock",
}

export type ContractData = {
  j1?: Address;
  j2?: Address;
  c2?: number;
  stake?: number;
  lastAction?: number;
};

export type Player = 1 | 2 | undefined;
