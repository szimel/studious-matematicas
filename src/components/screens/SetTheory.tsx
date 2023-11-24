import React from 'react';
import '../../css/set-theory.css';
import { Input } from '../helpers/input';
import { AnimateCircles } from '../helpers/VennDiagram';



export const SetTheory: React.FC = () => {

  //dummy data
  const diagramStyles = {
    A: { animate: false, },
    B: { animate: false, },
    C: { animate: false, },
    A_B: { animate: false, },
    A_C: { animate: false, },
    B_C: { animate: false, },
    A_B_C: { animate: true, }, 
  };

  return (
    <div className='st-container'>
      <div className='st-box'>
        <AnimateCircles styles={diagramStyles}/>
      </div>
      <div className='STBottomContainer'>
        <Input />
      </div>
    </div>
  );
};