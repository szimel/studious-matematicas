import React from 'react';
import '../../css/set-theory.css';
import { Input } from '../helpers/set-theory/input';
import { AnimateCircles } from '../helpers/set-theory/VennDiagram';
import { 
  SolutionType } from '../helpers/set-theory/useVennDiagramHighlighter';
import tippy from 'tippy.js';
import { useNavigate } from 'react-router-dom';
import BouncyText from '../custom/BouncyText';
import { AppContext } from '../main type shi/Context';

export type VennStateType = {
  solution: SolutionType;
  inputValue: string;
};

export const SetTheory: React.FC = () => {
  const { setTippyVisible } = React.useContext(AppContext); // context for closing error tippy
  const navigate = useNavigate();
  
  // tippy default for set theory popups
  tippy.setDefaultProps({
    animation: 'scale',
    theme: 'tomato',
  });

  const handleTutorialClick = () => {
    setTippyVisible('nonsensical');
    navigate('/tutorial');
  };

  return (
    <div className='st-container'>
      <div className='st-box'>
        <BouncyText onClick={handleTutorialClick}>
          <u className='noSelect'>{'<-'}Tutorial</u>
        </BouncyText>
        <AnimateCircles />
      </div>
      <div className='STBottomContainer'>
        <Input />
      </div>
    </div>
  );
};