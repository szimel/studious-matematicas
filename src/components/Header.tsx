import React from 'react';
import { SMText } from './custom/Text';
import { SideBarProps } from './Sidebar';
import { useNavigate } from 'react-router-dom';
import Tippy, { tippy } from '@tippyjs/react';
import '../css/header.css';
import 'tippy.js/animations/scale.css';

export const Header: React.FC<SideBarProps> = ({ items }) => {
  const navigate = useNavigate();

  // tippy content
  tippy.setDefaultProps({
    animation: 'scale',
    theme: 'tomato',
  });

  const handleClick = (link: string) => () => {
    navigate(link);
  };

  const openWindow = () => {
    window.open('https://github.com/szimel/studious-matematicas');
  };

  if (!items) {return null;}

  return (
    <div style={ styles.container }>
      <SMText className='pi-animation' style={{ fontSize: 30, cursor: 'default', }}>π</SMText>
      <div style={{ flexDirection: 'row', display: 'flex' }}>
        <Tippy
          content={
            <SMText>Check out the source code!</SMText>
          }
          hideOnClick={true}
        >
          <img src='./icon-code.svg' alt="Code icon" height={30} width={30} onClick={openWindow} 
            style={{ cursor: 'pointer' }}/>
        </Tippy>
        <Tippy 
          content={ 
            <div >
              {items.map((item, index) => (
                <div className='sidebarBox' key={ index } onClick={handleClick(item.link)}>
                  <SMText type='default' className='headerText'>
                    {item.text}
                  </SMText>
                </div>
              ))}
            </div>
          }
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
    maxHeight: 60,
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
  }
} as const; 