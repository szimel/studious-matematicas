/* eslint-disable max-len */
import React from 'react';
import { AppContext } from '../../Context';
import { SMButton } from '../../custom/Button';
import { SMText } from '../../custom/Text';


export const Input: React.FC = () => {
  const { updateVennData } = React.useContext(AppContext);
  const [inputValue, setInputValue] = React.useState('Click the above buttons!');
  // const buttonData = ['A', 'B', 'C', '∩', '∪', '’', '(', ')', 'delete'];
  const buttonData = [
    { text: 'A', bgColor: '#355070' },
    { text: 'B', bgColor: '#485373' },
    { text: 'C', bgColor: '#6d597a' },
    { text: '∩', bgColor: '#855d79' },
    { text: '∪', bgColor: '#9d6177' },
    { text: '’', bgColor: '#b56576' },
    { text: '(', bgColor: '#c56774' },
    { text: ')', bgColor: '#d56971' },
    { text: 'delete', bgColor: 'black' },
  ];

  function handleSubmit() {
    setInputValue('');
    updateVennData(inputValue);
  }

  // adds and deletes input values
  function changeInput(value: string) {
    // change the initial text
    if (inputValue.slice(-1) === '!') {setInputValue('');}

    switch (value) {
    case '’': {
      const lastChar = inputValue.trimEnd().slice(-1);
      // if the last character is a letter, add a typographic apostrophe
      if (!new Set(['∩', '∪', '(', '’']).has(lastChar)) {
        setInputValue(prevValue => `${prevValue.trimEnd()}${value + ' '}`);
      }
      break;
    }
    case 'delete':
      setInputValue(prevValue => prevValue.trimEnd().slice(0, -1));
      break;
    case '(':
      setInputValue(prevValue => `${prevValue}${value}`);
      break;
    case ')':
      setInputValue(prevValue => `${prevValue.trimEnd()}${value + ' '}`);
      break;
    default:
      setInputValue(prevValue => `${prevValue}${value + ' '}`);
    }
  }

  return (
    <>
      <div className='inputButtonContainer' >
        {buttonData.map((button, index) => (
          <SMButton
            key={index}
            color={'white'}
            bgColor={button.bgColor}
            onClick={() => changeInput(button.text)}
            text={button.text}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <div className='inputContainer'>
          <SMText type='default' color='white'>
            {inputValue}
          </SMText>
        </div>  
        <SMButton 
          color='black' 
          disabled={inputValue.length === 0} 
          bgColor='white' 
          onClick={handleSubmit} 
          text='Submit'/>
      </div>
    </>
  );
};