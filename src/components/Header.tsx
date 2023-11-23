import React, { useState } from 'react';
import { SMText } from './custom/Text';
import { SideBarProps } from './Sidebar';
import { useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import '../css/header.css';

export const Header: React.FC<SideBarProps> = ({ items }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const hanldeShow = () => {
    setShow(!show);
  };

  const handleClick = (link: string) => () => {
    navigate(link);
  };

  const openWindow = () => {
    window.open('https://github.com/szimel/studious-matematicas');
  };

  if (!items) {
    return (
      <div style={ styles.container }>
        <SMText className='pi-animation' style={{ fontSize: 30 }}>π</SMText>
        <Tippy animation='header-custom-animation'
          content={
            <div style={ styles.dropdown }>
              <SMText>
                Check out the source code!
              </SMText>
            </div>
          }
          interactive={true}
          allowHTML={true}
          delay={[0, 50]} 
          placement="bottom" 
          hideOnClick={true}
        >
          <img src='./icon-code.svg' alt="Code icon" height={30} width={30} onClick={openWindow}/>
        </Tippy>
      </div>
    );
  }

  return (
    <>
      <div style={ styles.container }>
        <img src='/icon-hamburger.svg' alt='hamburber' width={ 30 } onClick={hanldeShow}/>
        <SMText style={{ fontSize: 30 }}>π</SMText>
      </div>
      { show && (
        <div style={{ maxWidth: 200 }}>
          {items.map((item, index) => (
            <div className='sidebarBox' key={ index } onClick={handleClick(item.link)}>
              <SMText type='default' style={{ lineHeight: '200%', paddingLeft: 10 }}>
                {item.text}
              </SMText>
            </div>
          ))}
        </div>
      )}
    </>
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