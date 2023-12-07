import React, { useState } from 'react';
import '../../css/set-theory.css';
import { Input } from '../helpers/set-theory/input';
import { AnimateCircles } from '../helpers/set-theory/VennDiagram';
import { 
  SolutionType, useVennDiagramHighlighter 
} from '../helpers/set-theory/useVennDiagramHighlighter';
import tippy from 'tippy.js';
import { SMText } from '../custom/Text';
import { useNavigate } from 'react-router-dom';

export type VennStateType = {
  solution: SolutionType;
  inputValue: string;
};

export const SetTheory: React.FC = () => {
  const navigate = useNavigate();

  const handleTutorialClick = () => {
    navigate('/tutorial');
  };

  //empty venn diagram data
  const diagramStyles = useVennDiagramHighlighter('(A ∪ B ∪ C)\'');

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
        <SMText color='white' style={{ cursor: 'pointer' }} onClick={handleTutorialClick}>
          <u>{'<-'}Tutorial</u>
        </SMText>
        <AnimateCircles {...vennData}/>
      </div>
      <div className='STBottomContainer'>
        <Input setVennData={setVennData}/>
      </div>
    </div>
  );
};