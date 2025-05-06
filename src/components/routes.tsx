import React from 'react';
import '../css/routes.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SetTheory } from './screens/SetTheory';
import { Header } from './main type shi/Header';
import { Tutorial } from './screens/tutorial';
import { AnimatedRoute } from './helpers/animatedRoute';
import { AnimatePresence } from 'framer-motion';
import { AppContextProvider } from './main type shi/Context';
import { KamTest } from './screens/Kamkam';
import { TaeExample } from './screens/matea/[id]';

const AppRoutes: React.FC = () => (
  <div className="routes-container">
    <Router>
      <AppContextProvider>
        <Header/>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div className="routes-content">
            <AnimatePresence mode='wait'>
              <Routes>
                <Route path="/" element={<Navigate to="/set-theory" replace />} />
                <Route path="/set-theory" element={<AnimatedRoute><SetTheory/></AnimatedRoute>} />
                <Route path='/tutorial' element={<AnimatedRoute><Tutorial/></AnimatedRoute>} />
                <Route path='/kamkam' element={<KamTest />} />
                <Route path="/matea" element={<Navigate to="/matea/theorem-12" replace />} />
                <Route path="/matea/:id" element={
                  <AnimatedRoute><TaeExample /></AnimatedRoute>
                } />
              </Routes>
            </AnimatePresence>
          </div>
        </div>
      </AppContextProvider>
    </Router>
  </div>
);

export default AppRoutes;