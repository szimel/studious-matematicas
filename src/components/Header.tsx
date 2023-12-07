import React, { useRef } from 'react';
import { SMText } from './custom/Text';
import { SideBarProps } from './Sidebar';
import { useNavigate } from 'react-router-dom';
import Tippy, { tippy } from '@tippyjs/react';
import '../css/header.css';
import 'tippy.js/animations/scale.css';

export const Header: React.FC<SideBarProps> = ({ items }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div style={ styles.container }>
      
      {/* <SMText className='pi-animation' style={{ fontSize: 30, cursor: 'default', }}>π
      </SMText> */}
      {/* <img src='./pi.png' className='pi-animation' style={styles.headerImage}/> */}
      <video ref={videoRef} autoPlay muted style={ styles.headerImage } onClick={handleVideoClick}>
        <source src="./π.mp4" type="video/mp4"/>
        Your browser does not support the video tag.
      </video>
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
          content={ 
            <div >
              {items.map((item, index) => (
                <div className='sidebarBox' key={ index } onClick={handleClick(item.link)}>
                  <SMText color='black' type='default' className='headerText'>
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
  },
  headerImage: {
    height: 60,
    width: 60,
    marginRight: 10,
  },
} as const; 