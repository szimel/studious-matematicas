import Tippy from '@tippyjs/react';
import React, { useState } from 'react';
import { SMText } from '../custom/Text';
import { ReactComponent as SendIcon } from '../../icon-send.svg';


export const Input: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [color, setColor] = useState('rgb(87, 88, 90)');
  const blue = 'rgb(87, 88, 90)';
  const grey = 'rgb(151, 184, 248)';

  const validateInput = (value: string) => {
    const regex = /^[ABCUI() ]*$/; // Allow only A, B, C, U, I, parentheses, and space
  
    if (!regex.test(value.toUpperCase())) {
      value = value.slice(0, -1);

    } else {
      setInputValue(value.toUpperCase());
    }
  
    // Set color based on the current value
    setColor(value.length > 0 ? grey : blue);
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
        {' A, B, C, to find the relation between '}
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
        />
        <SendIcon width={30} height={30} fill={color}/>
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