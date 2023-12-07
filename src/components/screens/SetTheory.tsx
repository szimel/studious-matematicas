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
import BouncyText from '../custom/BouncyText';

export type VennStateType = {
  solution: SolutionType;
  inputValue: string;
};

export const SetTheory: React.FC = () => {
  const navigate = useNavigate();
  
  // tippy default for set theory popups
  tippy.setDefaultProps({
    animation: 'scale',
    theme: 'tomato',
  });

  const handleTutorialClick = () => {
    navigate('/tutorial');
  };

  return (
    <div className='st-container'>
      <div className='st-box'>
        <BouncyText onClick={handleTutorialClick}>
          <u>{'<-'}Tutorial</u>
        </BouncyText>
        <AnimateCircles />
      </div>
      <div className='STBottomContainer'>
        <Input />
      </div>
    </div>
  );
};