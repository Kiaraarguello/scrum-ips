import { useState, useEffect } from 'react';
import apiPublica from '../../servicios/apiPublica';
import './SolicitudPublica.css';

interface Sede { id: number; nombre: string; }

type Criticidad = 'baja' | 'media' | 'alta';

const CRITICIDAD_LABELS: Record<Criticidad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

const CRITICIDAD_DESC: Record<Criticidad, string> = {
  baja: 'Consulta general o tarea de rutina',
  media: 'Afecta el trabajo pero tiene solución temporal',
  alta: 'Impide operar o es atencion al público',
};

export default function SolicitudPublica() {
  const [sedes, setSedes] = useState<Sede[]>([]);

  const [titulo, setTitulo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [criticidad, setCriticidad] = useState<Criticidad>('baja');
  const [sedeId, setSedeId] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  const [bloqueaAtencion, setBloqueaAtencion] = useState<boolean | null>(null);

  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiPublica.get<Sede[]>('/publico/sedes').then(r => setSedes(r.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!titulo.trim() || !sedeId) {
      setError('Completá los campos obligatorios: descripción y sede.');
      return;
    }
    setEnviando(true);
    try {
      await apiPublica.post('/publico/solicitud', {
        titulo: titulo.trim(),
        detalle: detalle.trim() || undefined,
        criticidad,
        sede_id: Number(sedeId),
        nombre_contacto: nombre.trim() || undefined,
        telefono_contacto: telefono.trim() || undefined,
      });
      setEnviado(true);
    } catch {
      setError('Hubo un error al enviar la solicitud. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setTitulo(''); setDetalle(''); setCriticidad('baja');
    setSedeId(''); setNombre(''); setTelefono('');
    setBloqueaAtencion(null);
    setEnviado(false); setError('');
  }

  if (enviado) {
    return (
      <div className="sp-fondo">
        <div className="sp-caja sp-caja--exito">
          <div className="sp-exito-icono">✓</div>
          <h1 className="sp-exito-titulo">¡Solicitud enviada!</h1>
          <p className="sp-exito-texto">
            El equipo de sistemas recibió tu solicitud y la va a atender a la brevedad.
          </p>
          <button className="sp-btn sp-btn--secundario" onClick={reiniciar}>
            Enviar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-fondo">
      <div className="sp-caja">
        <div className="sp-encabezado">
          <div className="sp-logo">IPS</div>
          <div>
            <h1 className="sp-titulo">Solicitud de soporte</h1>
            <p className="sp-subtitulo">Sistemas — IPS Misiones</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="sp-formulario">

          {/* Descripción */}
          <div className="sp-campo">
            <label className="sp-etiqueta" htmlFor="sp-titulo">
              ¿Qué necesitás? <span className="sp-requerido">*</span>
            </label>
            <input
              id="sp-titulo"
              className="sp-input"
              type="text"
              placeholder="Ej: La impresora del piso 2 no imprime"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              maxLength={255}
              required
            />
          </div>

          {/* Sede */}
          <div className="sp-campo">
            <label className="sp-etiqueta" htmlFor="sp-sede">
              Sede <span className="sp-requerido">*</span>
            </label>
            <select
              id="sp-sede"
              className="sp-select"
              value={sedeId}
              onChange={e => setSedeId(e.target.value)}
              required
            >
              <option value="">Seleccioná tu sede</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Bloqueo atención al público */}
          <div className="sp-campo">
            <label className="sp-etiqueta">¿Este problema imposibilita la atención al público?</label>
            <div className="sp-bloqueo-opciones">
              <label className={`sp-bloqueo-opcion ${bloqueaAtencion === true ? 'sp-bloqueo-opcion--activa sp-bloqueo-opcion--si' : ''}`}>
                <input
                  type="radio"
                  name="bloqueaAtencion"
                  className="sp-radio-oculto"
                  checked={bloqueaAtencion === true}
                  onChange={() => { setBloqueaAtencion(true); setCriticidad('alta'); }}
                />
                Sí
              </label>
              <label className={`sp-bloqueo-opcion ${bloqueaAtencion === false ? 'sp-bloqueo-opcion--activa sp-bloqueo-opcion--no' : ''}`}>
                <input
                  type="radio"
                  name="bloqueaAtencion"
                  className="sp-radio-oculto"
                  checked={bloqueaAtencion === false}
                  onChange={() => setBloqueaAtencion(false)}
                />
                No
              </label>
            </div>
          </div>

          {/* Criticidad */}
          <div className="sp-campo">
            <label className="sp-etiqueta">Urgencia</label>
            <div className="sp-criticidad-opciones">
              {(['baja', 'media', 'alta'] as Criticidad[]).map(c => (
                <label
                  key={c}
                  className={`sp-criticidad-opcion sp-criticidad-opcion--${c} ${criticidad === c ? 'sp-criticidad-opcion--activa' : ''}`}
                >
                  <input
                    type="radio"
                    name="criticidad"
                    value={c}
                    checked={criticidad === c}
                    onChange={() => setCriticidad(c)}
                    className="sp-radio-oculto"
                  />
                  <span className="sp-criticidad-label">{CRITICIDAD_LABELS[c]}</span>
                  <span className="sp-criticidad-desc">{CRITICIDAD_DESC[c]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nombre y teléfono */}
          <div className="sp-fila">
            <div className="sp-campo">
              <label className="sp-etiqueta" htmlFor="sp-nombre">
                Nombre <span className="sp-opcional">(opcional)</span>
              </label>
              <input
                id="sp-nombre"
                className="sp-input"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
            </div>
            <div className="sp-campo">
              <label className="sp-etiqueta" htmlFor="sp-telefono">
                Teléfono <span className="sp-opcional">(opcional)</span>
              </label>
              <input
                id="sp-telefono"
                className="sp-input"
                type="tel"
                placeholder="Número o interno"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
              />
            </div>
          </div>

          {/* Detalle */}
          <div className="sp-campo">
            <label className="sp-etiqueta" htmlFor="sp-detalle">
              Detalle adicional <span className="sp-opcional">(opcional)</span>
            </label>
            <textarea
              id="sp-detalle"
              className="sp-textarea"
              placeholder="Describí el problema con más detalle, errores que aparecen, etc."
              value={detalle}
              onChange={e => setDetalle(e.target.value)}
              rows={4}
            />
          </div>

          {error && <p className="sp-error">{error}</p>}

          <button type="submit" className="sp-btn sp-btn--primario" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </div>
  );
}
