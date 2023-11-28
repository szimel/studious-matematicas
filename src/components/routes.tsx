import React from 'react';
import '../css/routes.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SideBar, SideBarItem } from './Sidebar';
import { SetTheory } from './screens/SetTheory';
import { Header } from './Header';

const AppRoutes: React.FC = () => {
  // items in side bar
  const items: SideBarItem[] = [
    {
      link: '/set-theory',
      text: 'Set Theory'
    },
  ];

  return (
    <div className="routes-container">
      <Router>
        <Header items={items} />
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <SideBar items={items}/>
          <div className="routes-content">
            <Routes>
              <Route path="/set-theory" element={<SetTheory />} />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
};

export default AppRoutes;