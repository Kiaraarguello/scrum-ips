# Scrum IPS Misiones

Sistema interno de gestion de tareas basado en metodologia Scrum.

## Requisitos

- Python 3.11+
- Node.js 18+
- MySQL 8

## Arranque

### Base de datos

```sql
CREATE DATABASE kanban_ips CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kanban_ips;
SOURCE crear_tablas.sql;
SOURCE datos_iniciales.sql;
```

O desde consola:

```bash
mysql -u root -p kanban_ips < crear_tablas.sql
mysql -u root -p kanban_ips < datos_iniciales.sql
```

### Backend

```bash
cd backend
cp .env.ejemplo .env
# Editar .env con los datos de la base de datos
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.ejemplo .env
# Editar .env si el backend no corre en localhost:8000
npm install
npm run dev
```

## Credenciales del admin de prueba

- Email: admin@empresa.com
- Password: Admin1234

## Notas

- El hash en datos_iniciales.sql corresponde a la password Admin1234 con bcrypt.
- Las fuentes Martel Sans y Caprasimo son opcionales: el sistema las declara con @font-face pero degrada gracilmente a Outfit si no estan presentes.
- Las carpetas de fuentes esperadas: src/assets/fonts/fuente_especial/ y src/assets/fonts/fuente_secundaria_especial/
