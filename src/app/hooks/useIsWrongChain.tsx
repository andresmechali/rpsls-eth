import { useEffect, useState } from "react";
import { useChain } from "@thirdweb-dev/react";

export default function useIsWrongChain() {
  const [isWrongChain, setIsWrongChain] = useState<boolean>(false);
  const chain = useChain();

  useEffect(() => {
    if (chain) {
      setIsWrongChain(chain.name !== "Sepolia");
    }
  }, [chain]);

  if (!chain) {
    return false;
  }

  return isWrongChain;
}
