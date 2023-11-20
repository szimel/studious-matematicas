import React from 'react';
import '../css/routes.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SideBar, SideBarItem } from './Sidebar';
import { SetTheory } from './screens/SetTheory';

const AppRoutes: React.FC = () => {
  // items in side bar
  const items: SideBarItem[] = [
    {
      link: '/set-theory',
      text: 'Set Theory'
    },
  ];

  return (
    <Router>
      <div className="container">
        <div className="sidebar">
          <SideBar items={items}/>
        </div>
        <div className="main-content">
          <Routes>
            <Route path="/set-theory" element={<SetTheory />} />
            {/* ... other routes */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default AppRoutes;