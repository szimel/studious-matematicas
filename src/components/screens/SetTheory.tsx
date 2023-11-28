import React, { useState } from 'react';
import '../../css/set-theory.css';
import { Input } from '../helpers/input';
import { AnimateCircles } from '../helpers/VennDiagram';
import { SolutionType } from '../helpers/useVennDiagramHighlighter';
import tippy from 'tippy.js';

export type VennStateType = {
  solution: SolutionType;
  inputValue: string;
};

export const SetTheory: React.FC = () => {
  //on load data
  const diagramStyles: SolutionType = {
    A: false,
    B: false,
    C: false,
    A_B: false,
    A_C: false,
    B_C: false,
    A_B_C: false,
  };

  // tippy defualt for set theory popups
  tippy.setDefaultProps({
    animation: 'scale',
    theme: 'tomato',
  });

  const initialState: VennStateType = {
    solution: diagramStyles,
    inputValue: '', // Initialize with an empty string or some default value
  };

  const [vennData, setVennData] = useState<VennStateType>(initialState);

  return (
    <div className='st-container'>
      <div className='st-box'>
        <AnimateCircles {...vennData}/>
      </div>
      <div className='STBottomContainer'>
        <Input setVennData={setVennData}/>
      </div>
    </div>
  );
};