import React from 'react';
import '../css/sidebar.css';
import { useNavigate } from 'react-router-dom';
import { SMText } from './custom/Text';

export interface SideBarItem {
  link: string;
  text: string;
}

interface SideBarProps {
  items: SideBarItem[];
}

export const SideBar: React.FC<SideBarProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleClick = (link: string) => () => {
    navigate(link);
  };

  return (
    <div className='sidebar'>
      <aside >
        {items.map((item, index) => (
          <div className='sidebarBox' key={ index } onClick={handleClick(item.link)}>
            <SMText>{item.text}</SMText>
          </div>
        ))}
      </aside>
    </div>
  );
};
