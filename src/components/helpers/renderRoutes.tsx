import React, { useState } from 'react';
import { SMText } from '../custom/Text';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import BouncyText from '../custom/BouncyText';
import { items, SideBarItem } from '../main type shi/Context';

export const Routes: React.FC = () => {
  if (!items) {return null;}

  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (link: string) => {
    setOpenDropdown(prev => (prev === link ? null : link));
  };
  const isDropdownOpen = (link: string) => openDropdown === link;

  const handleClick = (item: SideBarItem) => () => {
    if (item.subRoute) {
      toggleDropdown(item.link);
    } else {
      navigate(item.link);
    }
  };

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = isDropdownOpen(item.link);

        return (
          <div key={index} onClick={handleClick(item)}>
            <BouncyText>
              <SMText color="black" type="default" className="headerText">
                {item.text}
              </SMText>
            </BouncyText>

            {isOpen && item.subRoute && (
              <AnimatePresence>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: .5 }}
                  transition={{ duration: 0.3 }}
                  className="subRouteContainer"
                >
                  {item.subRoute.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      onClick={handleClick(subItem)}
                      className="sidebarBox"
                      color='black'
                    >
                      <BouncyText>
                        <SMText color="black" type="default" className="headerText">
                          {subItem.text}
                        </SMText>
                      </BouncyText>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </div>
  );
};
