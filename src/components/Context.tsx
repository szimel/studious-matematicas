/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useState, createContext } from 'react';
import { VennStateType } from './screens/SetTheory';
import { 
  SolutionType, 
  useVennDiagramHighlighter 
} from './helpers/set-theory/useVennDiagramHighlighter';

interface AppContextProviderProps {
  children: React.ReactNode;
}

// Define the context type
interface AppContextType {
  vennData: VennStateType;
  updateVennData: (inputValue: string) => void;
}

// Define a default context value
const defaultContextValue: AppContextType = {
  vennData: {
    solution: {
      setA: false,
      setB: false,
      setC: false,
      setAUnionB: false,
      setAUnionC: false,
      setBUnionC: false,
      setAUnionBUnionC: false,
    }, // Initialize with an empty or default solution
    inputValue: '',
  },
  updateVennData: () => {}, 
};

// Create the context with the default value
export const AppContext = createContext<AppContextType>(defaultContextValue);

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [vennData, setVennData] = useState<VennStateType>(defaultContextValue.vennData);

  const updateVennData = (inputValue: string) => {
    const solution: SolutionType = useVennDiagramHighlighter(inputValue); // Modify as needed
    setVennData(prevState => ({
      ...prevState,
      solution: solution,
      inputValue: inputValue,
    }));
  };

  return (
    <AppContext.Provider value={{ vennData, updateVennData }}>
      {children}
    </AppContext.Provider>
  );
};