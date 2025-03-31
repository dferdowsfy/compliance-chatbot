import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import App from './App';

console.log('Starting application...');

// Get root element
const container = document.getElementById('root');
console.log('Root element found:', !!container);

if (container) {
  try {
    // Create root
    const root = createRoot(container);
    
    // Render app
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering application:', error);
  }
} else {
  console.error('Root element not found!');
} 