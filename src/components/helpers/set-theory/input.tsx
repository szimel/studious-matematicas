import React from 'react';
import { AppContext } from '../../main type shi/Context';
import { SMButton } from '../../custom/Button';
import { SMText } from '../../custom/Text';
import Tippy from '@tippyjs/react';

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

export const Input: React.FC = () => {
  const { updateVennData, tippyVisible, setTippyVisible } = React.useContext(AppContext);
  const [inputValue, setInputValue] = React.useState('Click the above buttons!');
  const [error, setError] = React.useState({ errorChar: '', prevChar: '' });

  function handleSubmit() {
    setTippyVisible('nonsense'); // close the tippy
    setInputValue(''); // reset the input value
    updateVennData(inputValue); // send the input value to the venn diagram
  }

  function changeInput(value: string) {
    const lastChar = inputValue.trimEnd().slice(-1);
    if (inputValue.slice(-1) === '!') {setInputValue('');} // change the initial text
    setTippyVisible('hidden');

    // handle the input value, each case checks the last inputted character
    // and disallows certain characters after certain characters
    switch (value) {
    case '’': 
      if (!new Set(['∩', '∪', '(', '’']).has(lastChar)) {
        return setInputValue(prevValue => `${prevValue.trimEnd()}${value + ' '}`);
      } 
      return handleError(lastChar, value);
    case 'delete':
      return setInputValue(prevValue => prevValue.trimEnd().slice(0, -1));
    case '(':
      if (!new Set(['A', 'B', 'C', '’']).has(lastChar)) {
        return setInputValue(prevValue => `${prevValue}${value}`);
      } 
      return handleError(lastChar, value);
    case ')':
      if (lastChar !== '∪' && lastChar !== '∩') {
        return setInputValue(prevValue => `${prevValue.trimEnd()}${value + ' '}`);
      } 
      return handleError(lastChar, value);
    case '∪':
    case '∩':
      if (!new Set(['∩', '∪', '(']).has(lastChar)) {
        return setInputValue(prevValue => `${prevValue}${value + ' '}`);
      } 
      return handleError(lastChar, value);
    default:
      if (!new Set(['A', 'B', 'C', '’']).has(lastChar)) {
        return setInputValue(prevValue => `${prevValue}${value + ' '}`);
      }
      return handleError(lastChar, value);
    }
  }

  // handles the error tooltip. Updates the error state and sets the tippy to visible
  function handleError(prevChar: string, errorChar: string) {
    setError({ prevChar: prevChar, errorChar: errorChar });
    setTippyVisible('visible');
  }

  return (
    <>
      <Tippy 
        className='tippy-tooltip'
        placement='top-start'
        theme='dark' 
        arrow={false} 
        visible={tippyVisible === 'visible'}
        content={'You can\'t use character ' + error.errorChar + ' after ' + error.prevChar}>
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
      </Tippy>
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