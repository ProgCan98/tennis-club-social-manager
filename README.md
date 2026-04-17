# 🎾 Tennis Club Social Media Manager

Aplicación web frontend para organizar y planificar la gestión de redes sociales de un club de tenis.  
Sin backend: los datos viven en `localStorage` como arrays de objetos JSON.

## 🛠️ Tecnologías

- HTML5
- CSS3 (custom properties, flexbox, grid)
- JavaScript vanilla (ES6+)
- Persistencia: `localStorage`

## 📌 Estado

Proyecto en desarrollo — MVP en construcción iterativa.

---

## 📂 Estructura del proyecto

```
tennis-club-social-manager/
├── index.html                  ← Redirige a dashboard
├── README.md
├── assets/
│   ├── icons/
│   └── media/                  ← Imágenes/videos subidos (futuro)
├── pages/
│   ├── dashboard.html          ✅ Construido
│   ├── posts.html              ⬜ Pendiente
│   ├── ideas.html              ⬜ Pendiente
│   └── calendar.html           ⬜ Pendiente
├── scripts/
│   └── app.js                  ✅ Capa Storage + lógica Dashboard
└── styles/
    └── style.css               ✅ Construido
```

---

## 📊 Modelo de datos conceptual

### Entidades

#### Post

| Campo           | Tipo            | Notas                                        |
| --------------- | --------------- | -------------------------------------------- |
| `id`            | `string`        | Ej: `"post_173…"`                            |
| `title`         | `string`        | Título / asunto                              |
| `body`          | `string`        | Texto / caption del post                     |
| `status`        | `enum`          | `"idea"` · `"draft"` · `"scheduled"` · `"published"` |
| `platforms`     | `string[]`      | `["instagram","facebook"]`                   |
| `scheduledDate` | `string \| null`| ISO `"2026-04-20"`, null si idea/draft       |
| `publishedDate` | `string \| null`| Se llena al marcar publicado                 |
| `eventId`       | `string \| null`| FK → Event                                   |
| `mediaIds`      | `string[]`      | FK[] → Media                                 |
| `tags`          | `string[]`      | `["torneo","juveniles"]`                     |
| `createdAt`     | `string`        | ISO datetime                                 |
| `updatedAt`     | `string`        | ISO datetime                                 |

#### Idea

| Campo             | Tipo            | Notas                                      |
| ----------------- | --------------- | ------------------------------------------ |
| `id`              | `string`        |                                            |
| `title`           | `string`        |                                            |
| `description`     | `string`        | Detalle libre                              |
| `priority`        | `enum`          | `"alta"` · `"media"` · `"baja"`           |
| `status`          | `enum`          | `"nueva"` · `"aprobada"` · `"descartada"` · `"convertida"` |
| `convertedPostId` | `string \| null`| FK → Post (cuando se convierte)            |
| `tags`            | `string[]`      | Mismas etiquetas que Post                  |
| `createdAt`       | `string`        |                                            |

#### Event

| Campo         | Tipo            | Notas                                      |
| ------------- | --------------- | ------------------------------------------ |
| `id`          | `string`        |                                            |
| `title`       | `string`        |                                            |
| `date`        | `string`        | ISO date                                   |
| `endDate`     | `string \| null`| Para eventos de varios días                |
| `type`        | `enum`          | `"torneo"` · `"social"` · `"clase"` · `"otro"` |
| `description` | `string`        |                                            |
| `createdAt`   | `string`        |                                            |

#### Media

| Campo      | Tipo       | Notas                              |
| ---------- | ---------- | ---------------------------------- |
| `id`       | `string`   |                                    |
| `fileName` | `string`   | Nombre original del archivo        |
| `url`      | `string`   | Path local o data-URL              |
| `type`     | `enum`     | `"image"` · `"video"`             |
| `caption`  | `string`   | Descripción breve                  |
| `tags`     | `string[]` |                                    |
| `createdAt`| `string`   |                                    |

#### Task

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

- Las FK viven en el lado N (hijo): `Post.eventId`, `Task.postId`.
- `Post.mediaIds` es un array porque Media es reutilizable entre posts.
- `Idea.convertedPostId` da trazabilidad sin duplicar texto.

### Decisiones de diseño

| Decisión                          | Razón                                                       |
| --------------------------------- | ----------------------------------------------------------- |
| `Post.status` incluye `"idea"`    | Diferencia idea-creativa (Idea) de borrador-de-contenido (Post draft) |
| `mediaIds[]` en Post              | Media reutilizable entre posts, sin duplicar archivos       |
| `Idea.convertedPostId`            | Trazabilidad idea → post sin duplicar datos                 |
| Tags como `string[]` libres       | Flexibilidad máxima sin entidad Tag extra (suficiente para frontend) |
| Task con FK opcionales            | Una tarea puede ser de un post, de un evento, o independiente |

---

## 🖥️ Mapeo de pantallas ↔ datos

### Dashboard (`pages/dashboard.html`) ✅

| Sección                    | Datos que consume                       | Fuente en `app.js`      |
| -------------------------- | --------------------------------------- | ------------------------ |
| **Stat: Posts este mes**   | `Post[]` filtrados por mes actual       | `Posts.getThisMonth().length`  |
| **Stat: Pendientes**       | `Post[]` con status draft/scheduled     | `Posts.getPending().length`    |
| **Stat: Ideas guardadas**  | Total de `Idea[]`                       | `Ideas.getAll().length`        |
| **Stat: Próximos eventos** | `Event[]` con fecha ≥ hoy (máx 3)      | `Events.getUpcoming().length`  |
| **Lista: Próximas publicaciones** | Top 3 posts scheduled futuros   | `Posts.getUpcoming(3)` → `scheduledDate`, `title`, `platforms` |
| **Lista: Ideas recientes** | Top 3 ideas más nuevas                  | `Ideas.getRecent(3)` → `title`, `priority` |
| **Lista: Próximos eventos**| Top 3 eventos futuros                   | `Events.getUpcoming(3)` → `date`, `title`, `type` |

### Posts (`pages/posts.html`) ⬜

| Sección                    | Datos que consume                       | Campos visibles          |
| -------------------------- | --------------------------------------- | ------------------------ |
| **Filtros**                | Valores únicos de `platforms`, `status`, `tags` | — (UI de filtrado) |
| **Tabla/lista de posts**   | `Post[]` (todos, filtrable)             | `title`, `status`, `platforms`, `scheduledDate`, `tags` |
| **Detalle / formulario**   | Un `Post` + sus `Media[]` (via mediaIds) + `Event` (via eventId) | Todos los campos |
| **Acciones**               | —                                       | Crear · Editar · Eliminar · Cambiar status |

### Ideas (`pages/ideas.html`) ⬜

| Sección                    | Datos que consume                       | Campos visibles          |
| -------------------------- | --------------------------------------- | ------------------------ |
| **Filtros**                | Valores únicos de `priority`, `status`  | —                        |
| **Lista de ideas**         | `Idea[]` (todas, filtrable)             | `title`, `description`, `priority`, `status`, `tags` |
| **Detalle / formulario**   | Una `Idea`                              | Todos los campos         |
| **Acción: Convertir**      | Crea un `Post` nuevo, setea `Idea.convertedPostId` y `Idea.status = "convertida"` | — |
| **Acciones**               | —                                       | Crear · Editar · Eliminar · Convertir a Post |

### Calendario (`pages/calendar.html`) ⬜

| Sección                    | Datos que consume                       | Campos visibles          |
| -------------------------- | --------------------------------------- | ------------------------ |
| **Vista mensual (grilla)** | `Event[]` + `Post[]` con `scheduledDate` en el mes visible | `date`, `title`, `type` / `platforms` |
| **Lista lateral / modal**  | Items del día seleccionado              | Detalle del evento o post |
| **Formulario de evento**   | Un `Event`                              | Todos los campos         |
| **Acciones**               | —                                       | Crear · Editar · Eliminar evento |

### Flujo de datos entre pantallas

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

                  Dashboard lee TODO en modo resumen
```

---

## 🧪 Mock data (ejemplo mínimo)

```json
{
  "posts": [
    {
      "id": "post_001",
      "title": "Apertura Torneo de Verano",
      "body": "Este sábado arranca el torneo más esperado del año 🏆",
      "status": "scheduled",
      "platforms": ["instagram", "facebook"],
      "scheduledDate": "2026-04-25",
      "publishedDate": null,
      "eventId": "evt_001",
      "mediaIds": ["med_001"],
      "tags": ["torneo", "verano"],
      "createdAt": "2026-04-15T10:00:00Z",
      "updatedAt": "2026-04-16T14:30:00Z"
    },
    {
      "id": "post_002",
      "title": "Tips: cómo mejorar tu revés",
      "body": "3 ejercicios que podés hacer en casa para un revés más sólido 💪",
      "status": "draft",
      "platforms": ["instagram"],
      "scheduledDate": null,
      "publishedDate": null,
      "eventId": null,
      "mediaIds": ["med_002"],
      "tags": ["tips", "técnica"],
      "createdAt": "2026-04-16T09:00:00Z",
      "updatedAt": "2026-04-16T09:00:00Z"
    }
  ],
  "ideas": [
    {
      "id": "idea_001",
      "title": "Recorrido virtual por las canchas",
      "description": "Video corto mostrando las instalaciones renovadas",
      "priority": "alta",
      "status": "aprobada",
      "convertedPostId": null,
      "tags": ["instalaciones", "video"],
      "createdAt": "2026-04-10T08:00:00Z"
    },
    {
      "id": "idea_002",
      "title": "Entrevista a jugador destacado del mes",
      "description": "Preguntas cortas + foto en cancha",
      "priority": "media",
      "status": "nueva",
      "convertedPostId": null,
      "tags": ["comunidad", "entrevista"],
      "createdAt": "2026-04-12T11:30:00Z"
    }
  ],
  "events": [
    {
      "id": "evt_001",
      "title": "Torneo de Verano 2026",
      "date": "2026-04-25",
      "endDate": "2026-04-27",
      "type": "torneo",
      "description": "Categorías Sub-14, Sub-18 y Libre",
      "createdAt": "2026-04-01T10:00:00Z"
    },
    {
      "id": "evt_002",
      "title": "Clínica de Dobles",
      "date": "2026-05-03",
      "endDate": null,
      "type": "clase",
      "description": "Clase abierta para socios, foco en estrategia de dobles",
      "createdAt": "2026-04-05T15:00:00Z"
    }
  ],
  "media": [
    {
      "id": "med_001",
      "fileName": "torneo-flyer.png",
      "url": "assets/media/torneo-flyer.png",
      "type": "image",
      "caption": "Flyer oficial del Torneo de Verano",
      "tags": ["torneo", "flyer"],
      "createdAt": "2026-04-14T12:00:00Z"
    },
    {
      "id": "med_002",
      "fileName": "reves-tutorial.mp4",
      "url": "assets/media/reves-tutorial.mp4",
      "type": "video",
      "caption": "Demo de ejercicios de revés",
      "tags": ["tips", "video"],
      "createdAt": "2026-04-15T16:00:00Z"
    }
  ],
  "tasks": [
    {
      "id": "task_001",
      "title": "Diseñar flyer del torneo",
      "status": "completada",
      "dueDate": "2026-04-20",
      "postId": "post_001",
      "eventId": "evt_001",
      "createdAt": "2026-04-10T09:00:00Z"
    },
    {
      "id": "task_002",
      "title": "Grabar video de ejercicios de revés",
      "status": "pendiente",
      "dueDate": "2026-04-22",
      "postId": "post_002",
      "eventId": null,
      "createdAt": "2026-04-16T10:00:00Z"
    }
  ]
}
```

---

## 🗺️ Roadmap MVP

| Fase | Descripción                              | Estado |
| ---- | ---------------------------------------- | ------ |
| 1    | Modelo de datos + mock data              | ✅     |
| 2    | Mapeo pantallas ↔ datos                  | ✅     |
| 3    | Plan de funcionalidades MVP              | ✅     |
| 4    | Tareas pequeñas (backlog)                | ✅     |
| 5    | Implementación iterativa                 | ⬜     |

---

## 🎯 Plan de funcionalidades MVP

### Criterio de corte MVP

El MVP permite a una persona del club: **crear ideas, convertirlas en posts, programarlos en un calendario con eventos, y ver el resumen en el dashboard**. Sin login, sin notificaciones, sin integración real con redes.

### Funcionalidades por pantalla

#### F1 · Dashboard (lectura)

| ID    | Funcionalidad                        | Prioridad | Notas                            |
| ----- | ------------------------------------ | --------- | -------------------------------- |
| F1.1  | Ver 4 KPIs (stats cards)            | P0        | ✅ Ya implementado               |
| F1.2  | Ver próximas 3 publicaciones         | P0        | ✅ Ya implementado               |
| F1.3  | Ver 3 ideas recientes               | P0        | ✅ Ya implementado               |
| F1.4  | Ver 3 próximos eventos              | P0        | ✅ Ya implementado               |
| F1.5  | Links de navegación a cada sección   | P0        | ✅ Ya implementado               |

#### F2 · Posts (CRUD)

| ID    | Funcionalidad                        | Prioridad | Notas                            |
| ----- | ------------------------------------ | --------- | -------------------------------- |
| F2.1  | Listar todos los posts               | P0        | Tabla/cards con título, status, plataformas, fecha |
| F2.2  | Crear post nuevo (formulario modal)  | P0        | Campos: title, body, platforms[], scheduledDate, tags[] |
| F2.3  | Editar post existente                | P0        | Mismo formulario, precargado     |
| F2.4  | Eliminar post (con confirmación)     | P0        |                                  |
| F2.5  | Cambiar status de un post            | P0        | draft → scheduled → published (botones inline) |
| F2.6  | Filtrar posts por status             | P1        | Tabs o dropdown                  |
| F2.7  | Filtrar posts por plataforma         | P2        |                                  |
| F2.8  | Vincular post a evento existente     | P2        | Select con eventos disponibles   |

#### F3 · Ideas (CRUD + convertir)

| ID    | Funcionalidad                        | Prioridad | Notas                            |
| ----- | ------------------------------------ | --------- | -------------------------------- |
| F3.1  | Listar todas las ideas              | P0        | Cards con título, prioridad, status |
| F3.2  | Crear idea nueva (formulario modal)  | P0        | Campos: title, description, priority, tags[] |
| F3.3  | Editar idea existente                | P0        |                                  |
| F3.4  | Eliminar idea (con confirmación)     | P0        |                                  |
| F3.5  | Convertir idea en post               | P0        | Crea Post con title/tags de la idea, marca idea como "convertida" |
| F3.6  | Filtrar ideas por status/prioridad   | P1        |                                  |

#### F4 · Calendario (vista + CRUD eventos)

| ID    | Funcionalidad                        | Prioridad | Notas                            |
| ----- | ------------------------------------ | --------- | -------------------------------- |
| F4.1  | Grilla mensual con navegación ◀ ▶   | P0        | Muestra días del mes, nav prev/next |
| F4.2  | Mostrar eventos en el día correspondiente | P0   | Dot/badge con color por tipo     |
| F4.3  | Mostrar posts programados en el día  | P1        | Dot diferente al de eventos      |
| F4.4  | Crear evento nuevo (formulario modal)| P0        | Campos: title, date, endDate, type, description |
| F4.5  | Editar evento existente              | P0        |                                  |
| F4.6  | Eliminar evento (con confirmación)   | P0        |                                  |
| F4.7  | Click en día → ver detalle (lista)   | P1        | Panel lateral o modal            |

#### F5 · Infraestructura / Cross-cutting

| ID    | Funcionalidad                        | Prioridad | Notas                            |
| ----- | ------------------------------------ | --------- | -------------------------------- |
| F5.1  | Seed de mock data al primer uso      | P0        | Si localStorage vacío → cargar datos de ejemplo |
| F5.2  | Sidebar + navegación compartida      | P0        | ✅ Ya existe en dashboard.html, replicar |
| F5.3  | Componente modal reutilizable (CSS)  | P0        | Para todos los formularios CRUD  |
| F5.4  | Feedback visual (toast/notificación) | P1        | "Post creado", "Idea eliminada"  |
| F5.5  | Responsive básico (mobile sidebar)   | P2        | Sidebar colapsable               |

### Lo que queda FUERA del MVP

- Media (upload/galería) → v2
- Tasks (gestión de tareas) → v2
- Búsqueda global → v2
- Export/import de datos → v2
- Dark mode → v2

---

## 📋 Backlog de tareas (ordenado por implementación)

Cada tarea es pequeña (30 min – 2 h). Se implementan en orden.

### Sprint 1 — Infraestructura base

| #  | Tarea                                          | Depende de | Entregable                    |
| -- | ---------------------------------------------- | ---------- | ----------------------------- |
| 01 | Agregar keys `media` y `tasks` al objeto KEYS  | —          | `app.js` actualizado          |
| 02 | Cargar mock data en localStorage si está vacío (seed) | 01   | Función `seedIfEmpty()` en app.js |
| 03 | Extraer sidebar a un partial JS (inyección dinámica) | —     | Función `renderSidebar()` + sidebar sin duplicar HTML |
| 04 | Crear CSS del componente modal (`.modal`, `.modal__overlay`, `.modal__body`) | — | `style.css` actualizado |
| 05 | Crear CSS del componente toast (`.toast`)       | —          | `style.css` actualizado       |
| 06 | Crear helpers JS: `openModal()`, `closeModal()`, `showToast()` | 04, 05 | `app.js` actualizado    |

### Sprint 2 — Página Posts

| #  | Tarea                                          | Depende de | Entregable                    |
| -- | ---------------------------------------------- | ---------- | ----------------------------- |
| 07 | Crear HTML de `posts.html` (layout + sidebar + lista vacía) | 03 | Página navegable          |
| 08 | Renderizar lista de posts desde localStorage   | 07         | Función `renderPostsList()`   |
| 09 | Formulario modal: crear post nuevo              | 06, 08     | Función `createPost()`        |
| 10 | Formulario modal: editar post existente         | 09         | Función `updatePost()`        |
| 11 | Eliminar post con confirm dialog                | 08         | Función `deletePost()`        |
| 12 | Botones inline para cambiar status del post     | 08         | Transiciones draft→scheduled→published |
| 13 | Filtro por status (tabs)                        | 08         | UI de tabs + filtro en render |

### Sprint 3 — Página Ideas

| #  | Tarea                                          | Depende de | Entregable                    |
| -- | ---------------------------------------------- | ---------- | ----------------------------- |
| 14 | Crear HTML de `ideas.html` (layout + lista vacía) | 03      | Página navegable              |
| 15 | Renderizar lista de ideas desde localStorage   | 14         | Función `renderIdeasList()`   |
| 16 | Formulario modal: crear idea nueva              | 06, 15     | Función `createIdea()`        |
| 17 | Formulario modal: editar idea existente         | 16         | Función `updateIdea()`        |
| 18 | Eliminar idea con confirm dialog                | 15         | Función `deleteIdea()`        |
| 19 | Acción "Convertir en Post" (crea post + marca idea) | 09, 15 | Función `convertIdeaToPost()` |

### Sprint 4 — Página Calendario

| #  | Tarea                                          | Depende de | Entregable                    |
| -- | ---------------------------------------------- | ---------- | ----------------------------- |
| 20 | Crear HTML de `calendar.html` (layout + grilla vacía) | 03  | Página navegable              |
| 21 | Renderizar grilla mensual (días del mes actual) | 20        | Función `renderCalendar()`    |
| 22 | Navegación ◀ ▶ entre meses                     | 21         | Botones prev/next mes         |
| 23 | Mostrar eventos como dots en los días           | 21         | Lectura de Event[] por fecha  |
| 24 | Formulario modal: crear evento nuevo            | 06, 21     | Función `createEvent()`       |
| 25 | Formulario modal: editar evento existente       | 24         | Función `updateEvent()`       |
| 26 | Eliminar evento con confirm dialog              | 23         | Función `deleteEvent()`       |
| 27 | Click en día → panel con detalle de items       | 23         | Mini-lista contextual         |

### Sprint 5 — Pulido + integración

| #  | Tarea                                          | Depende de | Entregable                    |
| -- | ---------------------------------------------- | ---------- | ----------------------------- |
| 28 | Mostrar posts programados en el calendario      | 13, 23     | Dots de posts en grilla       |
| 29 | Dashboard: links funcionales "Ver todas →"      | 08, 15, 21 | Navegación verificada         |
| 30 | Fix bug dashboard: `p.platform` → `p.platforms` | —         | Bug fix en `renderDashboard()`|
| 31 | Validación de formularios (campos required)     | 09, 16, 24 | UX de validación básica       |
| 32 | Test manual completo del flujo Idea → Post → Calendar | 19, 28 | Chequeo end-to-end         |