import React, { useState, useEffect } from 'react'; // Added hooks
import { SMText } from './Text';
import Tippy, { tippy } from '@tippyjs/react';
import '../css/header.css';
import 'tippy.js/animations/scale.css';
import { Routes } from '../routes/components/renderRoutes';

export const Header: React.FC = () => {
  // 1. Create a state to track animation cycles
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // 2. Set up the 30-second timer
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTrigger((prev) => prev + 1);
    }, 30000); // 30,000ms = 30 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // tippy content
  tippy.setDefaultProps({
    animation: 'scale',
    theme: 'tomato',
  });

  const openWindow = () => {
    window.open('https://github.com/szimel/studious-matematicas');
  };

  return (
    <div className='main-header-container'>
      {/* 3. Apply the key here to force a reset every 30s */}
      <div className='logo' key={animationTrigger}>
        <SMText id='pi-7' type='header'>π</SMText>
        <SMText id='pi-5' type='header'>π</SMText>
        <SMText id='pi-4' type='header'>π</SMText>
        <SMText id='pi-3' type='header'>π</SMText>
        <SMText id='pi-2' type='header'>π</SMText>
        <SMText id='pi-1' type='header'>π</SMText>
      </div>

      <div style={{ flexDirection: 'row', display: 'flex' }}>
        <Tippy
          content={<SMText color='black'>Check out the source code!</SMText>}
          hideOnClick={true}
        >
          <img 
            src='/icon-code.svg' 
            alt="Code icon" 
            height={40} 
            width={40} 
            onClick={openWindow} 
            style={{ cursor: 'pointer' }}
          />
        </Tippy>
        <Tippy 
          content={<Routes />}
          interactive={true}
          allowHTML={true}
        >
          <img src='/icon-hamburger.svg' className='hamburgerIcon' alt="Menu"/>
        </Tippy>
      </div>
    </div>
  );
};