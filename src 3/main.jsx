import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import CustomerApp from './pages/index.jsx';
import BaristaView from './pages/baristaview.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/coffee" replace />} />
      <Route path="/coffee" element={<CustomerApp />} />
      <Route path="/baristaview" element={<BaristaView />} />
      <Route path="*" element={<Navigate to="/coffee" replace />} />
    </Routes>
  </BrowserRouter>
);
