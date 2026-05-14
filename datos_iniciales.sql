-- Datos iniciales: admin, sectores y sedes de ejemplo
-- Credenciales admin: email=admin@empresa.com | password=Admin1234

INSERT INTO sectores (nombre, descripcion, activo) VALUES
  ('Redes', 'Equipo de infraestructura y conectividad de red', 1),
  ('Conexion Remota', 'Equipo de soporte remoto y accesos VPN', 1),
  ('Soporte General', 'Equipo de soporte general de usuarios', 1);

INSERT INTO sedes (nombre, ciudad, direccion, activo) VALUES
  ('Casa Central', 'Buenos Aires', 'Av. Corrientes 1234', 1),
  ('Sucursal Norte', 'Rosario', 'Bv. Oronoz 567', 1),
  ('Sucursal Sur', 'La Plata', 'Calle 1 esquina 50', 1);

-- Hash bcrypt de 'Admin1234'
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, sector_id, activo) VALUES
  ('Administrador', 'Principal', 'admin@empresa.com',
   '$2b$12$a5rAavQfbeq3qIy9sX3ODe7/HJFtQjwx91A4CRSIPkFKgMESl8AIS',
   'admin', NULL, 1);
