// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/Chat.css'; 
import './styles/Terminal.css';
import './styles/AppLayout.css'


// 1. Find the "root" div in your public/index.html
const rootElement = document.getElementById('root');

if (rootElement) {
  // 2. Create a React "root" for that HTML element
  const root = ReactDOM.createRoot(rootElement);

  // 3. Tell React to render your <App /> component inside this root
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Make sure you have a div with id='root' in your public/index.html");
}