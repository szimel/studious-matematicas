import Tippy from '@tippyjs/react';
import React, { useState } from 'react';
import { SMText } from '../custom/Text';
import { ReactComponent as SendIcon } from '../../icon-send.svg';
import { SolutionType, useVennDiagramHighlighter } from './useVennDiagramHighlighter';
import { VennStateType } from '../screens/SetTheory';


interface InputProps {
  setVennData: React.Dispatch<React.SetStateAction<VennStateType>>;
}

export const Input: React.FC<InputProps> = ({ setVennData }) => {
  const [inputValue, setInputValue] = useState('');
  const [color, setColor] = useState('rgb(87, 88, 90)');
  const blue = 'rgb(87, 88, 90)';
  const grey = 'rgb(151, 184, 248)';

  const validateInput = (value: string) => {
    const regex = /^[ABCUI() ∩∪]*$/; // Allow A, B, C, U, I, parentheses
    let capsValue = value.toUpperCase();
  
    // If the value doesn't match the regex, remove the last character
    if (!regex.test(capsValue)) {
      value = value.slice(0, -1);
    } else if (capsValue.slice(-1) === 'I') { // use intersection symbol
      value = value.slice(0, -1) + '∩';
    } else if (capsValue.slice(-1) === 'U') {
      value = value.slice(0, -1) + '∪';
    }
  
    capsValue = value.toUpperCase();
    setInputValue(capsValue);
  
    // Set color based on the current value
    setColor(value.length > 0 ? grey : blue);
  };

  function handleSubmit() {
    const solution = useVennDiagramHighlighter(inputValue);
    setColor(blue);
    setVennData(prevState => ({
      ...prevState, // Spread the previous state to maintain any existing properties
      solution: solution, 
      inputValue: inputValue,
    }));
    setInputValue('');
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };
  

  return (
    <>
      <SMText type='default' style={{ color: 'white', marginBottom: 10 }}>
          Use the{' '}
        <Tippy delay={[0, 0]} content={
          <div style={ styles.tooltip }>
            <SMText>
                Sets are collections of distinct objects, considered as an object in its own right.
            </SMText>
          </div>
        }>
          <span style={{ fontWeight: '700', color: 'rgb(95, 106, 200)', cursor: 'pointer', }}>
            Sets
          </span>
        </Tippy>
        {' A, B, and C to find the relation between '}
        <Tippy delay={[0, 0]} content={
          <div style={ styles.tooltip }>
            <SMText>A union in set theory is all the unique elements from both sets</SMText>
          </div>
        }>
          <span style={{ fontWeight: '700', color: 'rgb(168, 109, 140)', cursor: 'pointer' }}>
      Unions
          </span>
        </Tippy>
        {' and '}
        <Tippy delay={[0, 0]} content={
          <div style={ styles.tooltip }>
            <SMText>
        An intersection in set theory is all the elements common to both sets
            </SMText>
          </div>
        }>
          <span style={{ fontWeight: 700, color: 'rgb(185, 117, 117)', cursor:'pointer' }}>
      Intersections
          </span>
        </Tippy>
      </SMText>

      <div className='inputContainer'>
        <input 
          type="text" 
          id="setInput" 
          placeholder="Enter a prompt here" 
          onChange={(e) => validateInput(e.target.value)} 
          value={inputValue}
          onKeyDown={handleKeyDown}
        />
        <SendIcon width={30} height={30} fill={color} onClick={handleSubmit}/>
      </div>
    </>
  );
};

const styles = {
  tooltip: {
    width: 200,
    height: 'auto',
    backgroundColor: '#eee',
    borderRadius: 15,
    padding: 15,
  }
};