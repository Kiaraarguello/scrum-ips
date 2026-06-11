import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './estilos/globales.css';
import './estilos/variables.css';
import './estilos/responsive.css';
import App from './App';

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('Elemento raiz no encontrado');

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>
);
