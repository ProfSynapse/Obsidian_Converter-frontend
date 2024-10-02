import React from 'react';
import ReactDOM from 'react-dom/client';
import ObsidianNoteConverter from './components/ObsidianNoteConverter/ObsidianNoteConverter';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ObsidianNoteConverter />
  </React.StrictMode>
);

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});