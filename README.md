# Tennis Club Social Manager

Aplicación web para planificar y organizar la presencia en redes sociales de un club de tenis. Permite gestionar ideas de contenido, programar publicaciones, coordinar eventos del club y visualizar todo desde un dashboard centralizado.

> **Estado del proyecto:** MVP vanilla (HTML/CSS/JS) completado ✅ — Migración a React en curso.

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

| Capa          | Vanilla (actual)                        | React (Fase 6)               |
| ------------- | --------------------------------------- | ---------------------------- |
| Estructura    | HTML5 semántico                         | JSX (React 18+)              |
| Estilos       | CSS3 (custom properties, flexbox, grid) | CSS Modules o mismo CSS      |
| Lógica        | JavaScript vanilla (ES6+)              | React + hooks                |
| Ruteo         | Archivos HTML separados                | React Router                 |
| Persistencia  | `localStorage` (JSON)                  | `localStorage` (sin cambios) |
| Build         | Ninguno                                | Vite                         |

---

## Decisiones técnicas destacables

- **Arquitectura sin backend** — datos como arrays JSON en `localStorage`, con capa `Storage` que abstrae serialización.
- **Modelo relacional en frontend** — 5 entidades (Post, Idea, Event, Media, Task) con foreign keys, evitando duplicación.
- **Sidebar como componente JS** — `renderSidebar()` inyecta la navegación leyendo `data-page` del `<body>`, sin duplicar HTML.
- **Seed automático** — `seedIfEmpty()` carga datos de ejemplo si `localStorage` está vacío.
- **IDs únicos sin UUID** — `timestamp + random base36`, suficiente para single-user sin colisiones.

---

## Cómo ejecutar

### Versión vanilla (HTML/CSS/JS)

No requiere instalación ni build. Abrí directamente en el navegador:

```bash
# Opción 1: abrir directamente
start vanilla/index.html

# Opción 2: servidor local (evita restricciones de file://)
npx serve vanilla
# Luego abrir http://localhost:3000
```

### Versión React (en desarrollo)

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
├── react/                       Nueva implementación con React + Vite
│   ├── src/                     Componentes, páginas, hooks y estado
│   ├── public/                  Assets estáticos
│   ├── package.json             Scripts y dependencias
│   └── vite.config.js           Configuración de build
├── README.md                    Documentación general del proyecto
└── docs/                        Capturas, notas o recursos complementarios
```

---

## Roadmap

| Fase | Descripción                    | Estado |
| ---- | ------------------------------ | ------ |
| 1    | Modelo de datos + mock data    | ✅     |
| 2    | Mapeo pantallas ↔ datos        | ✅     |
| 3    | Plan de funcionalidades MVP    | ✅     |
| 4    | Backlog de tareas              | ✅     |
| 5    | Implementación iterativa       | ✅     |
| 6    | Migración a React              | ⬜     |

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
<summary><strong>Fase 6 — Backlog de migración a React (0/17)</strong></summary>

### Sprint 6 — Setup + layout base

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 33 | Crear proyecto React con Vite (`npm create vite@latest`)           | ✅     |
| 34 | Migrar CSS existente (`style.css`) al proyecto React               | ⬜     |
| 35 | Crear componente `Layout` (sidebar + topbar + outlet)              | ⬜     |
| 36 | Crear componente `Sidebar` (reemplaza `renderSidebar()`)           | ⬜     |
| 37 | Configurar React Router con rutas: `/`, `/posts`, `/ideas`, `/calendar` | ⬜ |
| 38 | Migrar capa `Storage` y `seedIfEmpty()` como módulo JS             | ⬜     |

### Sprint 7 — Componentes compartidos

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 39 | Crear componente `Modal` (reemplaza `openModal`/`closeModal`)      | ⬜     |
| 40 | Crear componente `Toast` (reemplaza `showToast()`)                 | ⬜     |
| 41 | Crear componente `Tabs` reutilizable                               | ⬜     |
| 42 | Crear componente `ConfirmDialog` (reemplaza confirm modals)        | ⬜     |

### Sprint 8 — Páginas funcionales

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 43 | Migrar Dashboard como componente React                             | ⬜     |
| 44 | Migrar página Posts (lista + filtros + CRUD modal)                 | ⬜     |
| 45 | Migrar página Ideas (lista + filtros + CRUD + conversión)         | ⬜     |
| 46 | Migrar página Calendario (grilla + detalle día + CRUD eventos)   | ⬜     |

### Sprint 9 — Hooks, estado y pulido

| #  | Tarea                                                              | Estado |
| -- | ------------------------------------------------------------------ | ------ |
| 47 | Extraer custom hooks: `useLocalStorage`, `usePosts`, `useIdeas`, `useEvents` | ⬜ |
| 48 | Verificar paridad funcional con la versión vanilla                 | ⬜     |
| 49 | Test manual del flujo completo en React                            | ⬜     |

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
