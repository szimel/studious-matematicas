/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useState, createContext } from 'react';
import { VennStateType } from '../screens/SetTheory';
import { 
  SolutionType, 
  useVennDiagramHighlighter 
} from '../helpers/set-theory/useVennDiagramHighlighter';

interface AppContextProviderProps {
  children: React.ReactNode;
}

// Define the context type
interface AppContextType {
  vennData: VennStateType;
  updateVennData: (inputValue: string) => void;
  tippyVisible: string;
  setTippyVisible: React.Dispatch<React.SetStateAction<string>>;
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
  tippyVisible: 'goEagles',
  setTippyVisible: () => {},
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

  // context for closing tippy's on clicks outside tippy scope
  const [tippyVisible, setTippyVisible] = useState('');

  return (
    <AppContext.Provider value={{ vennData, updateVennData, tippyVisible, setTippyVisible }}>
      {children}
    </AppContext.Provider>
  );
};


// all the static stuff for routes
export interface SideBarItem {
  link: string;
  text: string;
	subRoute?: SideBarItem[];
}

export interface SideBarProps {
  items?: SideBarItem[];
}

export const items: SideBarItem[] = [
  {
    link: '/set-theory',
    text: 'Set Theory'
  },
  {
    link: '/matea',
    text: 'MATEA',
    subRoute: [
      {
        link: '/matea/theorem-12',
        text: 'Theorem 12',
      },
    ]
  },
];