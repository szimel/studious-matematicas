import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts/fonts.css';
import './css/index.css';
import AppRoutes from './components/routes';
import 'tippy.js/dist/tippy.css'; 


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);