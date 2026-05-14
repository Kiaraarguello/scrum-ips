import { Link } from 'react-router-dom';
import './NoEncontrada.css';

export default function NoEncontrada() {
  return (
    <div className="no-encontrada">
      <h1 className="no-encontrada__codigo">404</h1>
      <p className="no-encontrada__mensaje">Pagina no encontrada</p>
      <Link to="/tablero" className="no-encontrada__enlace">Volver al tablero</Link>
    </div>
  );
}
