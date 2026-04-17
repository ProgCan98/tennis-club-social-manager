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
| 3    | Plan de funcionalidades MVP              | ⬜     |
| 4    | Tareas pequeñas (backlog)                | ⬜     |
| 5    | Implementación iterativa                 | ⬜     |