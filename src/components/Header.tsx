import React, { useState } from 'react';
import { SMText } from './custom/Text';
import { SideBarProps } from './Sidebar';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC<SideBarProps> = ({ items }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const hanldeShow = () => {
    setShow(!show);
  };

  const handleClick = (link: string) => () => {
    navigate(link);
  };

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
    flex: 1,
    padding: '10px 20px',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eee'
  },
} as const; 