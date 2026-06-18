-- Auditoría (#159): tablas y permiso para super_admin
-- Ejecutar en MySQL (phpMyAdmin) si la auditoría no registra o Raul no ve los logs.

CREATE TABLE IF NOT EXISTS permiso_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rol VARCHAR(20) NOT NULL,
  clave VARCHAR(50) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY permiso_roles_rol_clave_key (rol, clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_sesiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  email VARCHAR(255) NULL,
  accion VARCHAR(100) NOT NULL,
  detalles TEXT NULL,
  ip VARCHAR(45) NULL,
  estado_codigo INT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aud_sesion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  email VARCHAR(255) NULL,
  accion VARCHAR(100) NOT NULL,
  detalles TEXT NULL,
  ip VARCHAR(45) NULL,
  estado_codigo INT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aud_usuario_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_sectores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  email VARCHAR(255) NULL,
  accion VARCHAR(100) NOT NULL,
  detalles TEXT NULL,
  ip VARCHAR(45) NULL,
  estado_codigo INT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aud_sector_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_sedes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  email VARCHAR(255) NULL,
  accion VARCHAR(100) NOT NULL,
  detalles TEXT NULL,
  ip VARCHAR(45) NULL,
  estado_codigo INT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aud_sede_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  email VARCHAR(255) NULL,
  accion VARCHAR(100) NOT NULL,
  detalles TEXT NULL,
  ip VARCHAR(45) NULL,
  estado_codigo INT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aud_tarea_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_pcs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  email VARCHAR(255) NULL,
  accion VARCHAR(100) NOT NULL,
  detalles TEXT NULL,
  ip VARCHAR(45) NULL,
  estado_codigo INT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aud_pc_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_proyectos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  email VARCHAR(255) NULL,
  accion VARCHAR(100) NOT NULL,
  detalles TEXT NULL,
  ip VARCHAR(45) NULL,
  estado_codigo INT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aud_proyecto_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Habilitar logs de auditoría para super_admin (Raul u otros auditores)
INSERT INTO permiso_roles (rol, clave, activo) VALUES ('super_admin', 'auditoria_logs', 1)
ON DUPLICATE KEY UPDATE activo = 1;
