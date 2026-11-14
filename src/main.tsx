import React from 'react';
import{createRoot}from'react-dom/client';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/600.css';
import './style.css';
import './auth.css';
import './reports.css';
import AuthApp from './AuthApp';

createRoot(document.getElementById('root')!).render(<React.StrictMode><AuthApp/></React.StrictMode>);
