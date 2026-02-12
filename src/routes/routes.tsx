import React from 'react';
import '../css/routes.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { AnimatedRoute } from './components/animatedRoute';
import { AppContextProvider } from '../context/Context';
import { SetTheory } from '../pages/set-theory/SetTheory';
import { Tutorial } from '../pages/set-theory/tutorial';
import { KamTest } from '../pages/Kamkam';
import { TaeExample } from '../pages/matea/[id]';
import { SeeingSounds } from '../pages/seeing-sounds/SeeingSounds';
import { SeeingSoundsAnalysis } from '../pages/seeing-sounds/Analysis';

const AppRoutes: React.FC = () => (
  <div className="routes-container">
    <Router>
      <AppContextProvider>
        <Header/>
        <div className="routes-content">
          {/* <AnimatePresence mode='wait'> */}
          <Routes>
            <Route path="/" element={<Navigate to="/set-theory" replace />} />
            <Route path="/set-theory" element={<AnimatedRoute><SetTheory/></AnimatedRoute>} />
            <Route path='/tutorial' element={<AnimatedRoute><Tutorial/></AnimatedRoute>} />
            <Route path='/kamkam' element={<KamTest />} />
            <Route path="/matea" element={<Navigate to="/matea/theorem-12" replace />} />
            <Route path="/matea/:id" element={
              <AnimatedRoute><TaeExample /></AnimatedRoute>
            } />
            <Route path="/seeing-sounds" element={<AnimatedRoute><SeeingSounds /></AnimatedRoute>} />
            <Route path="/seeing-sounds/analysis" element={<AnimatedRoute><SeeingSoundsAnalysis /></AnimatedRoute>} />
          </Routes>
          {/* </AnimatePresence> */}
        </div>
      </AppContextProvider>
    </Router>
  </div>
);

export default AppRoutes;