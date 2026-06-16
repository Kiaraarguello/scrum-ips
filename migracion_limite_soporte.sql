-- Control anti-spam en solicitudes públicas de soporte (/soporte)
ALTER TABLE tareas
  ADD COLUMN dni_contacto VARCHAR(20) NULL AFTER numero_contacto,
  ADD COLUMN solicitud_ip VARCHAR(45) NULL AFTER dni_contacto,
  ADD COLUMN titulo_normalizado VARCHAR(255) NULL AFTER solicitud_ip;

CREATE INDEX idx_tareas_solicitud_ip_fecha ON tareas (solicitud_ip, fecha_creacion);
CREATE INDEX idx_tareas_dni_fecha ON tareas (dni_contacto, fecha_creacion);
CREATE INDEX idx_tareas_duplicado_publico ON tareas (sede_id, dni_contacto, titulo_normalizado, fecha_creacion);
