import React from 'react';
import '../css/sidebar.css';
import { useNavigate } from 'react-router-dom';
import { SMText } from './custom/Text';
import { Header } from './Header';

export interface SideBarItem {
  link: string;
  text: string;
}

export interface SideBarProps {
  items: SideBarItem[];
}

export const SideBar: React.FC<SideBarProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleClick = (link: string) => () => {
    navigate(link);
  };


  return (
    <>
      <div className='sidebar'>
        <aside >
          {items.map((item, index) => (
            <div className='sidebarBox' key={ index } onClick={handleClick(item.link)}>
              <SMText type='default' style={{ lineHeight: '200%', paddingLeft: 10 }}>
                {item.text}
              </SMText>
            </div>
          ))}
        </aside>
      </div>
      
      {/* small breakpoints (<1000px) */}
      <div className='hamburger'>
        <Header items={items}/>
      </div>
    </>
  );
};
