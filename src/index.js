import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './styles/index.css';
import reportWebVitals from './reportWebVitals';

// If you're using any context providers, import them here
// import { SomeContextProvider } from './contexts/SomeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* If you have context providers, wrap the App component with them here */}
    {/* <SomeContextProvider> */}
      <App />
    {/* </SomeContextProvider> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// You can add any global error handling here
window.addEventListener('error', (event) => {
  // Log the error to your error tracking service
  console.error('Uncaught error:', event.error);
});