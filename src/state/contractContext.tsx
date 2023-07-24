import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { ContractData } from "@/types";

export const ContractContext = createContext<{
  contractData: ContractData;
  setContractData: Dispatch<SetStateAction<ContractData>>;
}>({
  contractData: {},
  setContractData: () => {}, // TODO: review
});

export function useContract() {
  return useContext(ContractContext);
}

export function ContractProvider({ children }: { children: ReactNode }) {
  const [contractData, setContractData] = useState<ContractData>({});

  return (
    <ContractContext.Provider value={{ contractData, setContractData }}>
      {children}
    </ContractContext.Provider>
  );
}
