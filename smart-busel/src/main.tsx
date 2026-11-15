import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { isAndroid } from './platform';

// Android: свой шрифт и шкала размеров (см. index.css, «платформа Android»)
if (isAndroid()) document.documentElement.classList.add('platform-android');

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
