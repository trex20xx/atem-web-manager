import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// =========================================================================
// ATEM WEB MANAGER - REACT BOOTSTRAP (v1.75)
// =========================================================================
// Initializes the React tree and mounts it to the DOM.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);