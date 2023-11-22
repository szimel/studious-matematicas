import React, { useState } from 'react';
import '../../css/set-theory.css';
import { SMText } from '../custom/Text';

export const SetTheory: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  const validateInput = (e: any) => {
    const regex = /^[ABCUI() ]*$/; // Allow only A, B, C, U, I, parentheses, and space
    if (!regex.test(e.target.value.toUpperCase())) {
      e.preventDefault();
    } else {setInputValue(e.target.value.toUpperCase());}
  };

  return (
    <div className='st-container'>
      <div className='st-box'>
        <SMText>TODO: this is where circles will be rendered</SMText>
      </div>
      <SMText>Preface</SMText>
      <SMText type='default'><b>Union(&cup;)</b>-</SMText>
      <SMText>A ∪ B: A &cup; B or A &#8746; B</SMText>
      <input 
        type="text" 
        id="setInput" 
        placeholder="Type your set expression here" 
        onChange={(e) => validateInput(e)} 
        value={inputValue}
      />
    </div>
  );
};