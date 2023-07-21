"use client";

type Props = {
  params: {
    gameId: string;
  };
};

export default function GamePage({ params: { gameId } }: Props) {
  console.log({ gameId });
  return <div>game here</div>;
}
