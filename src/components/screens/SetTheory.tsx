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
    setA: false,
    setB: false,
    setC: false,
    setAUnionB: false,
    setAUnionC: false,
    setBUnionC: false,
    setAUnionBUnionC: false,
  };

  // tippy default for set theory popups
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