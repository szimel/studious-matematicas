import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts/fonts.css';
import './css/index.css';
import 'tippy.js/dist/tippy.css'; 
import 'katex/dist/katex.min.css';
import AppRoutes from './routes/routes';



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);