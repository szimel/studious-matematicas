import React from 'react';
import '../css/routes.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SideBar, SideBarItem } from './Sidebar';
import { SetTheory } from './screens/SetTheory';
import { Header } from './Header';
import { Tutorial } from './screens/tutorial';
import { AnimatedRoute } from './helpers/animatedRoute';
import { AnimatePresence } from 'framer-motion';
import { AppContextProvider } from './Context';

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
        <AppContextProvider>
          <Header items={items} />
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <SideBar items={items}/>
            <div className="routes-content">
              <AnimatePresence mode='wait'>
                <Routes>
                  <Route path="/" element={<Navigate to="/set-theory" replace />} />
                  <Route path="/set-theory" element={<AnimatedRoute><SetTheory/></AnimatedRoute>} />
                  <Route path='/tutorial' element={<AnimatedRoute><Tutorial/></AnimatedRoute>} />
                </Routes>
              </AnimatePresence>
            </div>
          </div>
        </AppContextProvider>
      </Router>
    </div>
  );
};

export default AppRoutes;