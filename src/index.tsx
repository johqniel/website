// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/Chat_Glass.css';
import './styles/Chat_Retro.css';
import './styles/Chat_WhatsApp.css';
import './styles/Terminal_Glass.css';
import './styles/Terminal_Retro.css';
import './styles/Terminal_Simple.css';
import './styles/AppLayout_Premium.css';
import './styles/AppLayout_Retro.css';
import './styles/AppLayout_Hybrid.css';
import './styles/Global.css';


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