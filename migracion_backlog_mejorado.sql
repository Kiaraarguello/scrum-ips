-- Backlog mejorado (#156): IDs independientes y campos opcionales en tareas de proyecto
-- Ejecutar en MySQL (phpMyAdmin) ANTES del deploy del backend.

-- 1. Sector y sede opcionales (solo backlog las deja vacías; tablero sigue usándolas)
ALTER TABLE tareas
  MODIFY COLUMN sector_id INT NULL,
  MODIFY COLUMN sede_id INT NULL;

-- 2. Número de tarea propio del backlog (independiente del ID global del tablero)
ALTER TABLE tareas
  ADD COLUMN numero_backlog INT NULL AFTER proyecto_id;

-- 3. Índice único por proyecto (MySQL permite múltiples NULL en proyecto_id del tablero)
CREATE UNIQUE INDEX idx_tareas_proyecto_numero_backlog ON tareas (proyecto_id, numero_backlog);

-- 4. Numerar tareas de backlog existentes (ejecutar una sola vez, requiere MySQL 8+)
-- UPDATE tareas t
-- JOIN (
--   SELECT id,
--     ROW_NUMBER() OVER (PARTITION BY proyecto_id ORDER BY id) AS num
--   FROM tareas
--   WHERE proyecto_id IS NOT NULL
-- ) x ON t.id = x.id
-- SET t.numero_backlog = x.num
-- WHERE t.proyecto_id IS NOT NULL AND t.numero_backlog IS NULL;
