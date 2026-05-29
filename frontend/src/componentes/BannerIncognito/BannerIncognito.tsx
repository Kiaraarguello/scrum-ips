import { Eye, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contextos/ContextoAuth';
import './BannerIncognito.css';

export default function BannerIncognito() {
  const { usuario } = useAuth();
  const tokenReal = localStorage.getItem('token_real');

  if (!tokenReal || !usuario) return null;

  function salirDeIncognito() {
    const originalToken = localStorage.getItem('token_real');
    if (originalToken) {
      localStorage.setItem('token', originalToken);
      localStorage.removeItem('token_real');
      // Redirigir de vuelta al administrador de permisos limpiamente
      window.location.href = '/admin/permisos';
    }
  }

  const nombreRolMap: Record<string, string> = {
    super_usuario: 'Super Usuario',
    super_admin: 'Super Admin',
    admin: 'Administrador',
    usuario: 'Usuario Estándar',
  };

  const rolFormateado = nombreRolMap[usuario.rol] || usuario.rol;

  return (
    <div className="banner-incognito animate-slide-down">
      <div className="banner-incognito__contenido">
        <div className="banner-incognito__texto-bloque">
          <span className="banner-incognito__ojo-ping">
            <span className="banner-incognito__ping"></span>
            <Eye size={18} className="banner-incognito__icono" />
          </span>
          <p className="banner-incognito__mensaje">
            <strong>Modo Incógnito Activo:</strong> Visualizando el sistema con el rol de <span className="banner-incognito__rol-tag">{rolFormateado}</span>.
          </p>
        </div>
        <button className="banner-incognito__boton" onClick={salirDeIncognito}>
          <ArrowLeft size={16} />
          Volver a mi usuario
        </button>
      </div>
    </div>
  );
}
