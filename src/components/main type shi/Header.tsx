import React from 'react';
import { SMText } from '../custom/Text';
import Tippy, { tippy } from '@tippyjs/react';
import '../../css/header.css';
import 'tippy.js/animations/scale.css';
import { Routes } from '../helpers/renderRoutes';

export const Header: React.FC = () => {

  // tippy content
  tippy.setDefaultProps({
    animation: 'scale',
    theme: 'tomato',
  });

  const openWindow = () => {
    window.open('https://github.com/szimel/studious-matematicas');
  };

  return (
    <div style={ styles.container }>
      <div className='logo'>
        <SMText id='pi-7' type='header'>π</SMText>
        <SMText id='pi-5' type='header'>π</SMText>
        <SMText id='pi-4' type='header'>π</SMText>
        <SMText id='pi-3' type='header'>π</SMText>
        <SMText id='pi-2' type='header'>π</SMText>
        <SMText id='pi-1' type='header'>π</SMText>
      </div>

      <div style={{ flexDirection: 'row', display: 'flex' }}>
        <Tippy
          content={
            <SMText color='black'>Check out the source code!</SMText>
          }
          hideOnClick={true}
        >
          <img src='./icon-code.svg' alt="Code icon" height={40} width={40} onClick={openWindow} 
            style={{ cursor: 'pointer' }}/>
        </Tippy>
        <Tippy 
          content={<Routes />}
          interactive={true}
          allowHTML={true}
        >
          <img src='/icon-hamburger.svg' className='hamburgerIcon'/>
        </Tippy>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: 60,
    padding: '10px 20px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdown: {
    width: 200,
    height: 'auto',
    backgroundColor: '#eee',
    borderRadius: 15,
    padding: 15,
  },
  headerImage: {
    height: 60,
    width: 60,
    marginRight: 10,
  },
} as const; 
