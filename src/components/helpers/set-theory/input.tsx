import Tippy from '@tippyjs/react';
import React, { useState } from 'react';
import { SMText } from '../../custom/Text';
import { ReactComponent as SendIcon } from '../../../icon-send.svg';
import 'tippy.js/animations/scale.css';
import { AppContext } from '../../Context';


export const Input: React.FC = () => {
  const { updateVennData } = React.useContext(AppContext);
  const [firstLoad, setFirstLoad] = useState(true); // make tippy show on first load
  const [inputValue, setInputValue] = useState('');
  const [color, setColor] = useState('rgb(87, 88, 90)');
  const blue = 'rgb(87, 88, 90)';
  const grey = 'rgb(151, 184, 248)';

  const validateInput = (value: string) => {
    const regex = /^[ABCUI() ∩∪ '’]*$/; // Allow A, B, C, U, I, parentheses, typographic apostrophes
    let capsValue = value.toUpperCase();
  
    // If the value doesn't match the regex, remove the last character
    if (!regex.test(capsValue)) {
      value = value.slice(0, -1);
    } else if (capsValue.slice(-1) === 'I') { // use intersection symbol
      value = value.slice(0, -1) + '∩';
    } else if (capsValue.slice(-1) === 'U') { // use union symbol
      value = value.slice(0, -1) + '∪';
    } else if (capsValue.slice(-1) === '’') { // use typographic apostrophe
      value = value.slice(0, -1) + '\'';
    }
  
    capsValue = value.toUpperCase();
    setInputValue(capsValue);
  
    // Set color based on the current value
    setColor(value.length > 0 ? grey : blue);
  };

  function handleSubmit() {
    setColor(blue);
    updateVennData( inputValue);
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
        <Tippy content={
          <SMText color='black'>
            Sets are collections of distinct objects, considered as an object in its own right.
          </SMText>
        }>
          <span id='sets'>
            Sets
          </span>
        </Tippy>
        {' A, B, and C to find the relation between '}
        <Tippy content={
          <SMText color='black'>
            A union in set theory is all the unique elements from both sets
          </SMText>
        }>
          <span id='union'>Unions</span>
        </Tippy>
        {' and '}
        <Tippy content={
          <SMText color='black'>
            An intersection in set theory is all the elements common to both sets
          </SMText>
        }>
          <span id='intersection'>Intersections</span>
        </Tippy>
      </SMText>

      <div className='inputContainer'>
        <Tippy visible={firstLoad} onClickOutside={() => setFirstLoad(false)} content={
          <SMText color='black'>
            This input only accepts the characters A, B, C, U, I, parentheses, and apostrophes. 
            <br/>
            Type &apos;u&apos; for a union symbol and &apos;i&apos; for an intersection symbol
          </SMText>
        }>
          <input 
            type="text"
            autoComplete="off"
            id="setInput" 
            placeholder="Enter a set relation" 
            onChange={(e) => validateInput(e.target.value)} 
            value={inputValue}
            onKeyDown={handleKeyDown}
          />
        </Tippy>
        <SendIcon width={30} height={30} fill={color} onClick={handleSubmit}/>
      </div>
    </>
  );
};