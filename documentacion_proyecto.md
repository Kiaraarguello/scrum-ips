# Documentación del Proyecto - Scrum IPS Misiones

En el directorio principal se ubican los scripts de base de datos, configuraciones de despliegue y elementos gráficos compartidos.

* **`BD/`**: Contiene la configuración para levantar la base de datos MySQL localmente a través de contenedores.
  * **`docker-compose.yml`**: Define el servicio de MySQL para desarrollo local.
* **`crear_tablas.sql`**: Script SQL con la definición física de las tablas del sistema (Usuarios, Tareas, Sedes, Sectores, Auditorías, etc.) usando el motor InnoDB y charset utf8mb4.
* **`datos_iniciales.sql`**: Script de inserción inicial para la base de datos (carga de roles predefinidos, sectores por defecto y el usuario administrador inicial).
* **`globales.css`**: Hoja de estilos general de respaldo.
* **`logo-nombre.svg` y `logo-siglas.svg`**: Archivos gráficos de la marca del IPS (logos oficiales en formato vectorial).
* **`subir_zip.txt`**: Documento instructivo sobre la estructura exacta que debe tener el empaquetado `.zip` para desplegar en servidores de hosting (como Hostinger).
* **`README.md`**: Guía rápida de instalación de dependencias y comandos de arranque para los entornos locales.

---

##  Backend (`backend-node/`)

Servidor API REST desarrollado en **Node.js** con el framework **Express** y **Prisma ORM** para interactuar con la base de datos MySQL.

* **`prisma/`**: Carpeta de configuración de la base de datos mediante el ORM.
  * **`schema.prisma`**: Archivo principal de Prisma. Modela todas las entidades de la base de datos (relaciones de tareas, usuarios, auditorías de sectores y permisos de rol) y autogenera el cliente JavaScript para consultas.
* **`src/`**: Carpeta contenedora del código fuente del backend.
  * **`db.js`**: Instancia y exporta el cliente de Prisma (`PrismaClient`) para interactuar con la base de datos en toda la aplicación.
  * **`seguridad.js`**: Contiene utilidades de criptografía (hashing de contraseñas mediante `bcryptjs`).
  * **`index.js`**: Punto de entrada del servidor Express. Inicializa las rutas, define middlewares globales (CORS, JSON, auditoría) e incluye lógica de inicialización para asegurar que existan los sectores principales en la base de datos al encender el servicio.
  * **`middleware/`**: Interceptores de peticiones HTTP:
    * **`auth.js`**: Valida tokens JWT, verifica roles y comprueba los permisos activos asignados a cada nivel de usuario.
    * **`auditoria.js`**: Registra de forma automática todas las operaciones que alteran datos (creación, edición, borrado) guardando detalles, IP de origen y código de estado en sus respectivas tablas de auditoría.
  * **`routes/`**: Archivos controladores que exponen los endpoints de la API:
    * **`alertas.js`**: Administración y lectura de notificaciones para el panel de administración.
    * **`auditoria.js`**: Consulta de logs de auditoría general y por módulos.
    * **`autenticacion.js`**: Login y control de sesiones.
    * **`estadisticas.js`**: Endpoint para el cálculo y consulta de KPIs, porcentajes de avance y gráficos de rendimiento de usuarios.
    * **`historial.js`**: Historial de movimientos y transiciones de estado de las tareas.
    * **`pcs.js`**: Endpoints para el registro de estado y control de computadoras (PCs).
    * **`permisos.js`**: Configuración dinámica de permisos por rol.
    * **`proyectos.js`**: Operaciones CRUD para la entidad Proyectos.
    * **`publico.js`**: Enlaces públicos para la creación externa de solicitudes/tickets.
    * **`sectores.js` y `sedes.js`**: Administración de las áreas y locaciones físicas del IPS.
    * **`tareas.js`**: CRUD principal y asignación de múltiples encargados para tareas/tickets.
    * **`usuarios.js`**: Gestión completa de cuentas de usuario, estado activo/inactivo y asignación de sectores.
* **`Dockerfile`**: Instrucciones de construcción de la imagen de Docker para desplegar el backend en producción.
* **`package.json`**: Listado de dependencias del backend (Express, Prisma, JWT, Bcrypt, Cors) y scripts de desarrollo (`npm run dev`).
* **`.env.example`**: Archivo plantilla que define las variables de entorno requeridas (puertos, credenciales de base de datos, claves secretas JWT).

---

##  Frontend (`frontend/`)

Interfaz de usuario SPA desarrollada con **React**, **Vite** y **TypeScript**.

* **`src/`**: Código fuente de la interfaz gráfica.
  * **`main.tsx`**: Archivo de entrada de React que monta la aplicación en el DOM de HTML.
  * **`App.tsx`**: Componente raíz del cliente. Declara las rutas protegidas y públicas con React Router y define la estructura general de diseño de la aplicación.
  * **`vite-env.d.ts`**: Archivo de tipos globales para variables e importaciones procesadas por Vite.
  * **`assets/`**: Logos vectoriales utilizados dentro de la interfaz gráfica.
  * **`contextos/`**: Manejadores de estado global de React:
    * **`ContextoAuth.tsx`**: Gestiona el inicio de sesión, almacenamiento del token, sectores activos del usuario y la simulación del rol administrativo (*Vista Incógnito*).
    * **`ContextoNotificaciones.tsx`**: Administra las alertas del sistema y mensajes temporales (Toasts).
  * **`servicios/`**: Clientes de comunicación con el backend (Axios):
    * **`api.ts`**: Configuración base de Axios que inyecta automáticamente el token JWT en las cabeceras de cada petición.
    * **`apiPublica.ts`**: Cliente configurado sin cabeceras de autorización para las peticiones públicas (creación de tickets anónimos).
    * **[Archivos auxiliares]** (`tareas.ts`, `usuarios.ts`, `permisos.ts`, etc.): Contienen las funciones específicas que consumen los endpoints del backend correspondientes a su nombre.
  * **`tipos/`**:
    * **`index.ts`**: Archivo TypeScript unificado con las interfaces y contratos de datos utilizados en toda la app (interfaces para `Usuario`, `Tarea`, `Sector`, `Auditoria`, etc.).
  * **`utilidades/`**: Funciones puras de ayuda:
    * **`formatoFecha.ts`**: Formateador de marcas de tiempo a fechas de lectura simple.
    * **`pesoCriticidad.ts`**: Mapeador que asigna pesos numéricos a los niveles de criticidad (Baja, Media, Alta) para facilitar ordenamientos.
  * **`estilos/`**:
    * **`variables.css`**: Define los tokens de diseño globales (paleta de colores HSL, tipografías y fuentes del IPS).
    * **`globales.css`**: Reglas generales de diseño de la app, scrollbars y resets de CSS.

###  Componentes (`frontend/src/componentes/`)
*Cada carpeta en esta sección agrupa los archivos `.tsx` (estructura y lógica) y `.css` (estilos específicos) del componente respectivo:*

* **`BadgeCriticidad/`**: Etiqueta visual de color dinámico según la prioridad de una tarea (Baja, Media, Alta, Urgente).
* **`BannerIncognito/`**: Barra superior de advertencia que se muestra al administrador cuando simula los permisos de un rol regular (*Vista de Incógnito*).
* **`BarraNavegacion/`**: Menú lateral principal de navegación que filtra sus opciones dinámicamente según los permisos del usuario activo.
* **`Boton/`**: Botón reutilizable estilizado con soporte para variantes (primario, secundario, peligro, etc.).
* **`CampoTexto/`**: Campo de entrada de texto estandarizado y estilizado con soporte para etiquetas y validaciones visuales.
* **`ColumnaTablero/`**: Rinde la columna correspondiente a un estado del tablero Scrum (Kanban) y actúa como contenedor interactivo de arrastrar y soltar (*drag & drop*).
* **`ModalAsignarUsuario/`**: Ventana flotante para vincular múltiples usuarios responsables a una tarea específica.
* **`ModalEditarPC/`**: Modal para registrar y actualizar especificaciones técnicas y estados de equipos informáticos.
* **`ModalEditarTarea/`**: Panel emergente para editar los detalles de un ticket de tarea existente.
* **`ModalFinalizarTarea/`**: Modal obligatorio para cambiar una tarea al estado "Finalizada", forzando la redacción de la solución técnica aplicada.
* **`ModalNuevaTarea/`**: Formulario emergente para crear nuevas tareas asignadas a sectores específicos.
* **`PanelNotificaciones/`**: Desplegable lateral con la lista de notificaciones y alertas pendientes del administrador.
* **`RutaProtegida/`**: Envoltura de seguridad en el enrutado de React que desvía a los usuarios no autenticados o sin los permisos de rol correspondientes.
* **`Selector/`**: Desplegable de selección personalizado con soporte para búsquedas y opciones estilizadas.
* **`TarjetaTarea/`**: Tarjeta visual compacta de la tarea para el tablero Scrum, que muestra prioridad, personas asignadas, etiquetas y es arrastrable.

###  Páginas (`frontend/src/paginas/`)
*Cada vista o página de la aplicación web se organiza en su propia carpeta conteniendo su respectivo archivo de código React (`.tsx`) y de estilos (`.css`):*

* **`AdministradorPermisos/`**: Panel interactivo del administrador para activar y desactivar los permisos granularmente por rol, e iniciar la simulación de vista de otros roles.
* **`EstadisticasUsuarios/`**: Panel gráfico con KPIs, métricas de tareas completadas por sector e informes de rendimiento de colaboradores.
* **`GestionBacklog/`**: Vista del backlog de tareas ordenadas para planificación antes de pasar al tablero activo.
* **`GestionSectores/`**: Panel de creación, listado y edición de los sectores de trabajo del IPS.
* **`GestionSedes/`**: CRUD para la administración de las sedes del IPS (añadir ciudades, direcciones y notas).
* **`GestionUsuarios/`**: Listado de usuarios activos representados en tarjetas adaptables (Grid Layout), desde donde se pueden editar roles, sectores o dar de baja cuentas.
* **`HistorialTareas/`**: Tabla interactiva de auditoría de movimientos de estado de tareas, ideal para trazabilidad.
* **`Login/`**: Formulario de acceso al sistema con manejo de cookies/tokens de sesión.
* **`MiPanel/`**: Tablero personal del usuario con sus estadísticas individuales y tareas pendientes asignadas.
* **`NoEncontrada/`**: Pantalla de error 404 para URLs no existentes en el frontend.
* **`PanelAdmin/`**: Cuadrícula de accesos directos rápidos del administrador para la gestión modular.
* **`PanelAuditoria/`**: Visualizador de registros de auditoría del sistema (sesiones, cambios en tareas, PCs, etc.).
* **`Pendiente/`**: Pantalla de bloqueo informativo para cuentas recién creadas que no tienen un sector asignado por administración.
* **`ProyectoDetalle/`**: Panel detallado que agrupa las tareas asignadas a un proyecto de desarrollo o infraestructura específico.
* **`RegistroPCs/`**: Panel de control del inventario y estado de reparación de las computadoras registradas.
* **`SeleccionSector/`**: Pantalla interactiva que obliga a los usuarios con múltiples sectores a elegir su área de trabajo activa al iniciar sesión.
* **`SolicitudPublica/`**: Portal abierto para que personal ajeno al sistema pueda emitir solicitudes técnicas o reportar incidentes mediante un formulario simplificado.
* **`Tablero/`**: Tablero Kanban interactivo que muestra las tareas activas clasificadas en "Por Hacer", "En Proceso" y "Pendiente".

---

##  Configuraciones y Archivos Adicionales en Frontend

* **`index.html`**: Estructura base de la aplicación Single Page Application (SPA) sobre la que se inyecta React.
* **`vite.config.ts`**: Configuración de Vite para compilar los recursos de React, cargar plugins y levantar el servidor local de desarrollo.
* **`tsconfig.json` y `tsconfig.node.json`**: Configuración de TypeScript con las reglas de compilación estricta para el cliente.
* **`Dockerfile` y `.dockerignore`**: Archivos de automatización para generar el contenedor del frontend con Nginx.
* **`nginx.conf`**: Configuración del servidor web ligero Nginx que sirve los archivos compilados del frontend y maneja el enrutado interno del cliente (*History API*).
* **`package.json`**: Lista de dependencias del cliente (dnd-kit para drag and drop, Lucide icons, Axios, React Router) y scripts (`npm run dev`, `npm run build`).
* **`.env.ejemplo`**: Definición de la variable de entorno base para conectar el frontend con la API URL del backend.
