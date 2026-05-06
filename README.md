# Tennis Club Social Manager

Aplicación web para planificar y organizar la presencia en redes sociales de un club de tenis. Permite gestionar ideas de contenido, programar publicaciones, coordinar eventos del club y visualizar todo desde un dashboard centralizado.

> **Estado del proyecto:** MVP vanilla ✅ — Migración a React ✅ — Backend API ✅ — Integración React → API ✅ — QA completo ✅

> 🔗 **Demo en vivo:** [tennis-club-social-manager.vercel.app](https://tennis-club-social-manager.vercel.app/)

---

## Funcionalidades

| Pantalla        | Descripción                                                                  |
| --------------- | ---------------------------------------------------------------------------- |
| **Dashboard**   | KPIs en tiempo real (posts del mes, pendientes, ideas, eventos) + resúmenes  |
| **Publicaciones** | CRUD completo con estados (borrador → programado → publicado), filtros por status y soporte multi-plataforma |
| **Ideas**       | Banco de ideas con prioridades, filtros por estado y conversión directa a post |
| **Calendario**  | Vista mensual con eventos y posts programados, panel de detalle por día       |

Además:
- Datos de ejemplo precargados automáticamente en el primer uso
- Navegación dinámica con sidebar compartido generado por JS
- Modales y toasts reutilizables para CRUD y feedback visual

---

## Stack tecnológico

| Capa          | Vanilla (Fase 5)                        | React (Fase 6)               | Backend (Fase 7)              |
| ------------- | --------------------------------------- | ---------------------------- | ----------------------------- |
| Estructura    | HTML5 semántico                         | JSX (React 19+)              | Node.js + Express 5           |
| Estilos       | CSS3 (custom properties, flexbox, grid) | CSS Modules o mismo CSS      | —                             |
| Lógica        | JavaScript vanilla (ES6+)              | React + hooks                | CommonJS, async/await         |
| Ruteo         | Archivos HTML separados                | React Router                 | Express Router                |
| Persistencia  | `localStorage` (JSON)                  | `localStorage` (sin cambios) | PostgreSQL en Neon            |
| Auth          | —                                      | —                            | JWT + bcryptjs                |
| Build         | Ninguno                                | Vite                         | —                             |
| Deploy        | —                                      | Vercel                       | Render / Railway              |

---

## Decisiones técnicas destacables

- **Arquitectura sin backend (Fases 1-6)** — datos como arrays JSON en `localStorage`, con capa `Storage` que abstrae serialización.
- **Modelo relacional en frontend** — 5 entidades (Post, Idea, Event, Media, Task) con foreign keys, evitando duplicación.
- **Sidebar como componente JS** — `renderSidebar()` inyecta la navegación leyendo `data-page` del `<body>`, sin duplicar HTML.
- **Seed automático** — `seedIfEmpty()` carga datos de ejemplo si `localStorage` está vacío.
- **IDs únicos sin UUID** — `timestamp + random base36`, suficiente para single-user sin colisiones.
- **Autenticación con JWT** — tokens firmados con `jsonwebtoken`, verificados por middleware `auth.js` en cada ruta protegida.
- **Contraseñas con bcryptjs** — hash con salt rounds 10; nunca se almacena el texto plano.
- **Sin ORM** — queries SQL directas con el driver `pg` para mantener control total y simplicidad.
- **AuthContext** — contexto global que expone `user`, `login`, `register`, `logout`; inicializa la sesión desde `localStorage` al cargar la app.
- **PrivateRoute** — componente que redirige a `/login` si no hay sesión activa, protegiendo todas las rutas de la app.
- **Módulo `api.js`** — cliente HTTP centralizado con `fetch`; inyecta el Bearer token automáticamente y redirige a `/login` ante 401/403.
- **`utils.js`** — helpers puros sin dependencias (`formatDate`); reemplaza a `data.js` que fue eliminado junto con `storage.js` y `seed.js` al completar la migración a la API.

---

## Deploy

Deployado en **Vercel** con build automático desde el branch `master`.

🔗 [tennis-club-social-manager.vercel.app](https://tennis-club-social-manager.vercel.app/)

El archivo `vercel.json` en la raíz del repo le indica a Vercel que el proyecto a buildear está en la subcarpeta `react/`, con `npm run build` como comando y `dist/` como output. Cada push a `master` dispara un nuevo deploy automáticamente.

---

## Cómo ejecutar (local)

### API (Node.js + Express)

```bash
cd api
npm install
# Crear archivo .env con DATABASE_URL y JWT_SECRET
npm run dev
# Servidor en http://localhost:3001
```

### Versión vanilla (HTML/CSS/JS)

No requiere instalación ni build. Abrí directamente en el navegador:

```bash
# Opción 1: abrir directamente
start vanilla/index.html

# Opción 2: servidor local (evita restricciones de file://)
npx serve vanilla
# Luego abrir http://localhost:3000
```

### Versión React

```bash
cd react
npm install
npm run dev
# Luego abrir http://localhost:5173
```

---

## Estructura del proyecto

```
tennis-club-social-manager/
├── vanilla/                     Implementación original en HTML/CSS/JS
│   ├── index.html               Redirect automático al dashboard
│   ├── pages/
│   │   ├── dashboard.html       Dashboard con KPIs y resúmenes
│   │   ├── posts.html           CRUD completo de publicaciones
│   │   ├── ideas.html           CRUD completo de ideas + conversión a post
│   │   └── calendar.html        Calendario mensual + panel de detalle por día
│   ├── scripts/
│   │   └── app.js               Storage, seed, sidebar, modal/toast, CRUD (Posts, Ideas, Calendar)
│   ├── styles/
│   │   └── style.css            Reset, layout, componentes (modal, toast, tabs, items, calendar, forms)
│   └── assets/
│       └── icons/
├── react/                       Implementación React + Vite (integrada con la API)
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx  Estado global de sesión (login/register/logout)
│   │   ├── lib/
│   │   │   ├── api.js           Cliente HTTP con Bearer token automático
│   │   │   ├── auth.js          Helpers JWT: saveAuth, getToken, clearAuth
│   │   │   └── utils.js         Helpers puros: formatDate
│   │   ├── hooks/               usePosts, useIdeas, useEvents, useToast (llaman a la API)
│   │   ├── components/          Layout, Sidebar, Modal, Toast, Tabs, ConfirmDialog
│   │   ├── pages/               DashboardPage, PostsPage, IdeasPage, CalendarPage, LoginPage
│   │   ├── App.jsx              Rutas con React Router + PrivateRoute
│   │   ├── main.jsx             Punto de entrada
│   │   └── style.css            CSS migrado desde la versión vanilla
│   ├── package.json         React 19, React Router, Vite
│   ├── vite.config.js       Configuración de build
│   └── vercel.json          SPA rewrites para React Router en Vercel
├── api/                         Backend API REST (Node.js + Express + PostgreSQL)
│   ├── index.js                 Servidor Express, rutas montadas, error handler
│   ├── src/
│   │   ├── db.js                Conexión a PostgreSQL (Neon) via pg
│   │   ├── middleware/
│   │   │   └── auth.js          Middleware JWT (verifica Bearer token)
│   │   └── routes/
│   │       ├── users.js         POST /register · POST /login
│   │       ├── posts.js         CRUD /api/posts
│   │       ├── ideas.js         CRUD /api/ideas
│   │       └── events.js        CRUD /api/events
│   ├── .env                     Variables de entorno (DATABASE_URL, JWT_SECRET)
│   └── package.json             Express 5, pg, bcryptjs, jsonwebtoken, nodemon
├── README.md                    Documentación general del proyecto
└── docs/                        Capturas, notas o recursos complementarios
```

---

## Roadmap

| Fase | Descripción                                      | Estado |
| ---- | ------------------------------------------------ | ------ |
| 1    | Modelo de datos + mock data                      | ✅     |
| 2    | Mapeo pantallas ↔ datos                          | ✅     |
| 3    | Plan de funcionalidades MVP                      | ✅     |
| 4    | Backlog de tareas                                | ✅     |
| 5    | Implementación iterativa (vanilla)               | ✅     |
| 6    | Migración a React + deploy en Vercel             | ✅     |
| 7    | Backend API REST (Node.js + Express + PostgreSQL) | ✅     |
| 8    | Integración React → API (reemplazar localStorage) | ✅     |

**Fuera del alcance del MVP:** Media (upload/galería) · Tasks (gestión de tareas) · Búsqueda global · Export/import · Dark mode

---

## Progreso detallado

<details>
<summary><strong>Fase 5 — Backlog vanilla (32/32 completadas ✅)</strong></summary>

### Sprint 1 — Infraestructura base

| #  | Tarea                                                    | Estado |
| -- | -------------------------------------------------------- | ------ |
| 01 | Agregar keys `media` y `tasks` al objeto KEYS           | ✅     |
| 02 | Cargar mock data en localStorage si está vacío (seed)    | ✅     |
| 03 | Extraer sidebar a un partial JS (inyección dinámica)     | ✅     |
| 04 | Crear CSS del componente modal                           | ✅     |
| 05 | Crear CSS del componente toast                           | ✅     |
| 06 | Crear helpers JS: `openModal()`, `closeModal()`, `showToast()` | ✅ |

### Sprint 2 — Página Posts

| #  | Tarea                                                    | Estado |
| -- | -------------------------------------------------------- | ------ |
| 07 | Crear HTML de `posts.html`                               | ✅     |
| 08 | Renderizar lista de posts desde localStorage             | ✅     |
| 09 | Formulario modal: crear post nuevo                       | ✅     |
| 10 | Formulario modal: editar post existente                  | ✅     |
| 11 | Eliminar post con confirm dialog                         | ✅     |
| 12 | Botones inline para cambiar status del post              | ✅     |
| 13 | Filtro por status (tabs)                                 | ✅     |

### Sprint 3 — Página Ideas

| #  | Tarea                                                    | Estado |
| -- | -------------------------------------------------------- | ------ |
| 14 | Crear HTML de `ideas.html`                               | ✅     |
| 15 | Renderizar lista de ideas desde localStorage             | ✅     |
| 16 | Formulario modal: crear idea nueva                       | ✅     |
| 17 | Formulario modal: editar idea existente                  | ✅     |
| 18 | Eliminar idea con confirm dialog                         | ✅     |
| 19 | Convertir idea en post                                   | ✅     |

### Sprint 4 — Página Calendario

| #  | Tarea                                                    | Estado |
| -- | -------------------------------------------------------- | ------ |
| 20 | Crear HTML de `calendar.html`                            | ✅     |
| 21 | Renderizar grilla mensual                                | ✅     |
| 22 | Navegación entre meses                                   | ✅     |
| 23 | Mostrar eventos como dots en los días                    | ✅     |
| 24 | Formulario modal: crear evento nuevo                     | ✅     |
| 25 | Formulario modal: editar evento existente                | ✅     |
| 26 | Eliminar evento con confirm dialog                       | ✅     |
| 27 | Click en día → panel con detalle                         | ✅     |

### Sprint 5 — Pulido + integración

| #  | Tarea                                                    | Estado |
| -- | -------------------------------------------------------- | ------ |
| 28 | Mostrar posts programados en el calendario               | ✅     |
| 29 | Dashboard: links funcionales "Ver todas →"               | ✅     |
| 30 | Fix bug: `p.platform` → `p.platforms`                    | ✅     |
| 31 | Validación de formularios                                | ✅     |
| 32 | Test manual del flujo completo                           | ✅     |

</details>

<details>
<summary><strong>Fase 6 — Backlog de migración a React (17/17 completadas ✅)</strong></summary>

### Sprint 6 — Setup + layout base

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 33 | Crear proyecto React con Vite (`npm create vite@latest`)           | ✅     |
| 34 | Migrar CSS existente (`style.css`) al proyecto React               | ✅     |
| 35 | Crear componente `Layout` (sidebar + topbar + outlet)              | ✅     |
| 36 | Crear componente `Sidebar` (reemplaza `renderSidebar()`)           | ✅     |
| 37 | Configurar React Router con rutas: `/`, `/posts`, `/ideas`, `/calendar` | ✅ |
| 38 | Migrar capa `Storage` y `seedIfEmpty()` como módulo JS             | ✅     |

### Sprint 7 — Componentes compartidos

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 39 | Crear componente `Modal` (reemplaza `openModal`/`closeModal`)      | ✅     |
| 40 | Crear componente `Toast` (reemplaza `showToast()`)                 | ✅     |
| 41 | Crear componente `Tabs` reutilizable                               | ✅     |
| 42 | Crear componente `ConfirmDialog` (reemplaza confirm modals)        | ✅     |

### Sprint 8 — Páginas funcionales

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 43 | Migrar Dashboard como componente React                             | ✅     |
| 44 | Migrar página Posts (lista + filtros + CRUD modal)                 | ✅     |
| 45 | Migrar página Ideas (lista + filtros + CRUD + conversión)         | ✅     |
| 46 | Migrar página Calendario (grilla + detalle día + CRUD eventos)   | ✅     |

### Sprint 9 — Hooks, estado y pulido

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 47 | Extraer custom hooks: `usePosts`, `useIdeas`, `useEvents`, `useToast` | ✅ |
| 48 | Verificar paridad funcional con la versión vanilla                 | ✅     |
| 49 | Test manual del flujo completo en React                            | ✅     |

</details>

<details>
<summary><strong>Fase 7 — Backlog backend API (21/21 completadas ✅)</strong></summary>

### Sprint 10 — Setup + auth

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 50 | Crear proyecto Express + estructura de carpetas (`api/src/routes`, `middleware`) | ✅ |
| 51 | Configurar dependencias: express, pg, bcryptjs, jsonwebtoken, cors, dotenv, nodemon | ✅ |
| 52 | Crear DB PostgreSQL en Neon + tabla `users`                       | ✅     |
| 53 | Conectar Express a PostgreSQL (`src/db.js`)                       | ✅     |
| 54 | `POST /api/users/register` (hash bcrypt + responde JWT)           | ✅     |
| 55 | `POST /api/users/login` (verifica bcrypt + responde JWT)          | ✅     |
| 56 | Middleware `auth.js` (verifica Bearer token, inyecta `req.user`)  | ✅     |
| 57 | Crear archivos de rutas vacíos: posts.js, ideas.js, events.js     | ✅     |
| 58 | Tests en Thunder Client: register + login                         | ✅     |

### Sprint 11 — CRUD Posts

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 59 | Crear tabla `posts` en PostgreSQL                                 | ✅     |
| 60 | `GET /api/posts` — listar todos los posts (`?status=` para filtrar) | ✅   |
| 61 | `POST /api/posts` — crear post nuevo                              | ✅     |
| 62 | `PUT /api/posts/:id` — editar post                                | ✅     |
| 63 | `DELETE /api/posts/:id` — soft delete (`deleted_at`)              | ✅     |

### Sprint 12 — CRUD Ideas y Events

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 64 | Crear tablas `ideas` y `events` en PostgreSQL                     | ✅     |
| 65 | CRUD completo `/api/ideas` (GET, POST, PUT, DELETE)               | ✅     |
| 65b| `PUT /api/ideas/:id/convert` — convierte idea en borrador de post | ✅     |
| 66 | CRUD completo `/api/events` (GET, POST, PUT, DELETE) + `?month=`  | ✅     |
| 67 | Tests en Thunder Client: todos los endpoints CRUD                 | ✅     |

### Sprint 13 — Deploy API

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 68 | Deploy de la API en Render o Railway                              | ✅     |
| 69 | Configurar variables de entorno en el servicio de deploy          | ✅     |

</details>

<details>
<summary><strong>Fase 8 — Backlog integración React → API (13/13 completadas ✅)</strong></summary>

### Sprint 14 — Cliente HTTP

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 70 | Crear módulo `src/lib/api.js` con baseURL y header Authorization  | ✅     |
| 71 | Implementar `LoginPage` con tabs login/registro                   | ✅     |
| 72 | Crear `AuthContext` (login, register, logout, isAuthenticated)     | ✅     |

### Sprint 15 — Reemplazar localStorage por API

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 73 | Actualizar `usePosts` para llamar a `/api/posts`                  | ✅     |
| 74 | Actualizar `useIdeas` para llamar a `/api/ideas` + `/convert`     | ✅     |
| 75 | Actualizar `useEvents` para llamar a `/api/events`                | ✅     |
| 76 | Eliminar `storage.js`, `seed.js`, `data.js`; extraer helpers a `utils.js` | ✅ |

### Sprint 16 — Pulido final

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 77 | Manejo de errores HTTP (401, 404, 500) en la UI                   | ✅     |
| 78 | Loading states mientras la API responde                           | ✅     |
| 79 | Test manual del flujo completo con DB real + deploy verificado    | ✅     |

### Sprint 17 — QA y bugfixes

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 80 | Fix: construcción de objetos en modal (Posts, Ideas, Calendar)     | ✅     |
| 81 | Fix: relación de datos DB ↔ modal en `IdeasPage` y `PostsPage`    | ✅     |
| 82 | Fix: bug en `usePosts` detectado durante pruebas de `useEvents`   | ✅     |

</details>

---

## Documentación técnica

<details>
<summary><strong>Modelo de datos (5 entidades)</strong></summary>

### Post

| Campo           | Tipo            | Notas                                        |
| --------------- | --------------- | -------------------------------------------- |
| `id`            | `string`        | Ej: `"post_173…"`                            |
| `title`         | `string`        | Título / asunto                              |
| `body`          | `string`        | Texto / caption del post                     |
| `status`        | `enum`          | `"draft"` · `"scheduled"` · `"published"`    |
| `platforms`     | `string[]`      | `["instagram","facebook"]`                   |
| `scheduledDate` | `string \| null`| ISO date, null si draft                      |
| `publishedDate` | `string \| null`| Se llena al marcar publicado                 |
| `eventId`       | `string \| null`| FK → Event                                   |
| `mediaIds`      | `string[]`      | FK[] → Media                                 |
| `tags`          | `string[]`      | `["torneo","juveniles"]`                     |
| `createdAt`     | `string`        | ISO datetime                                 |
| `updatedAt`     | `string`        | ISO datetime                                 |

### Idea

| Campo             | Tipo            | Notas                                      |
| ----------------- | --------------- | ------------------------------------------ |
| `id`              | `string`        |                                            |
| `title`           | `string`        |                                            |
| `description`     | `string`        | Detalle libre                              |
| `priority`        | `enum`          | `"alta"` · `"media"` · `"baja"`           |
| `status`          | `enum`          | `"nueva"` · `"aprobada"` · `"descartada"` · `"convertida"` |
| `convertedPostId` | `string \| null`| FK → Post (cuando se convierte)            |
| `tags`            | `string[]`      |                                            |
| `createdAt`       | `string`        |                                            |

### Event

| Campo         | Tipo            | Notas                                      |
| ------------- | --------------- | ------------------------------------------ |
| `id`          | `string`        |                                            |
| `title`       | `string`        |                                            |
| `date`        | `string`        | ISO date                                   |
| `endDate`     | `string \| null`| Para eventos de varios días                |
| `type`        | `enum`          | `"torneo"` · `"social"` · `"clase"` · `"otro"` |
| `description` | `string`        |                                            |
| `createdAt`   | `string`        |                                            |

### Media *(fuera del MVP)*

| Campo      | Tipo       | Notas                              |
| ---------- | ---------- | ---------------------------------- |
| `id`       | `string`   |                                    |
| `fileName` | `string`   | Nombre original del archivo        |
| `url`      | `string`   | Path local o data-URL              |
| `type`     | `enum`     | `"image"` · `"video"`             |
| `caption`  | `string`   | Descripción breve                  |
| `tags`     | `string[]` |                                    |
| `createdAt`| `string`   |                                    |

### Task *(fuera del MVP)*

| Campo      | Tipo            | Notas                                    |
| ---------- | --------------- | ---------------------------------------- |
| `id`       | `string`        |                                          |
| `title`    | `string`        |                                          |
| `status`   | `enum`          | `"pendiente"` · `"en-progreso"` · `"completada"` |
| `dueDate`  | `string \| null`|                                          |
| `postId`   | `string \| null`| FK → Post                               |
| `eventId`  | `string \| null`| FK → Event                              |
| `createdAt`| `string`        |                                          |

### Relaciones

```
Event  1 ──→ N  Post        Un evento genera varios posts
Post   1 ──→ N  Media       Un post tiene varias fotos/videos (via mediaIds[])
Idea   1 ──→ 0..1  Post     Una idea aprobada se convierte en un post
Post   1 ──→ N  Task        Tareas asociadas a un post
Event  1 ──→ N  Task        Tareas asociadas a un evento
```

Las FK viven en el lado N (hijo). `Post.mediaIds` es un array porque Media es reutilizable entre posts. `Idea.convertedPostId` da trazabilidad sin duplicar texto.

</details>

<details>
<summary><strong>Mapeo pantallas ↔ datos</strong></summary>

### Dashboard

| Sección                         | Datos                           | Fuente                               |
| ------------------------------- | ------------------------------- | ------------------------------------ |
| Stat: Posts este mes            | `Post[]` filtrados por mes      | `Posts.getThisMonth().length`        |
| Stat: Pendientes                | `Post[]` draft/scheduled        | `Posts.getPending().length`          |
| Stat: Ideas guardadas           | Total de `Idea[]`               | `Ideas.getAll().length`             |
| Stat: Próximos eventos          | `Event[]` fecha ≥ hoy           | `Events.getUpcoming().length`       |
| Lista: Próximas publicaciones   | Top 3 posts scheduled           | `Posts.getUpcoming(3)`              |
| Lista: Ideas recientes          | Top 3 ideas más nuevas          | `Ideas.getRecent(3)`               |
| Lista: Próximos eventos         | Top 3 eventos futuros           | `Events.getUpcoming(3)`            |

### Posts

| Sección             | Datos                                           |
| ------------------- | ----------------------------------------------- |
| Filtros (tabs)      | `status`: all · draft · scheduled · published   |
| Lista de posts      | `Post[]` completo, filtrable y ordenable         |
| Formulario modal    | Campos: título, body, plataformas, estado, fecha, tags |
| Acciones            | Crear · Editar · Eliminar · Avanzar status      |

### Ideas

| Sección             | Datos                                           |
| ------------------- | ----------------------------------------------- |
| Filtros (tabs)      | `status`: all · nueva · aprobada · convertida · descartada |
| Lista de ideas      | `Idea[]` completo, filtrable                    |
| Formulario modal    | Campos: título, descripción, prioridad, estado, tags |
| Acciones            | Crear · Editar · Eliminar · Convertir a Post    |

### Calendario

| Sección             | Datos                                           |
| ------------------- | ----------------------------------------------- |
| Grilla mensual      | `Event[]` + `Post[]` con scheduledDate como dots |
| Navegación          | Botones prev/next para cambiar de mes           |
| Detalle del día     | Lista de eventos y posts del día seleccionado   |
| Formulario modal    | Campos: título, fecha, fecha fin, tipo, descripción |
| Acciones            | Crear · Editar · Eliminar evento                |

### Flujo entre pantallas

```
 ┌──────────┐   convertir    ┌──────────┐   vincular    ┌──────────┐
 │  Ideas   │ ──────────────→│  Posts    │←──────────────│ Calendar │
 │          │  crea Post +   │          │  Post.eventId  │ (Events) │
 └──────────┘  actualiza Idea└──────────┘                └──────────┘
                                  │
                           mediaIds[]
                                  ↓
                            ┌──────────┐
                            │  Media   │
                            └──────────┘

                  Dashboard lee todo en modo resumen
```

</details>

---

## Autor

Desarrollado como proyecto personal para gestión real de redes sociales de un club de tenis.

## Licencia

MIT
