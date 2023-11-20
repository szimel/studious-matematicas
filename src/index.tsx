import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts/fonts.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AppRoutes from './routes';
// import { Header } from './components/Header';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* <Header /> */}
    <AppRoutes />
  </React.StrictMode>
);

reportWebVitals();
