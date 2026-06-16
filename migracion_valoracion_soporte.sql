-- Valoración del solicitante en solicitudes públicas de soporte
ALTER TABLE tareas
  ADD COLUMN valoracion_solicitante TINYINT NULL AFTER pendiente_descripcion,
  ADD COLUMN comentario_solicitante TEXT NULL AFTER valoracion_solicitante,
  ADD COLUMN fecha_valoracion DATETIME NULL AFTER comentario_solicitante;
