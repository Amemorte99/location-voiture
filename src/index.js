import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#111827',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#E3383C',
              secondary: '#fff',
            },
          },
        }}
      />
      <App />
  </React.StrictMode>
);
