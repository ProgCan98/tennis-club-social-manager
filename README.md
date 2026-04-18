# Tennis Club Social Manager

Aplicación web para planificar y organizar la presencia en redes sociales de un club de tenis. Permite gestionar ideas de contenido, programar publicaciones, coordinar eventos del club y visualizar todo desde un dashboard centralizado.

> **Estado del proyecto:** MVP en desarrollo activo.

<!-- TODO: descomentar cuando haya capturas reales
![Dashboard](docs/screenshots/dashboard.png)
-->

---

## Funcionalidades

- **Dashboard** con KPIs en tiempo real (posts del mes, pendientes, ideas, eventos)
- **Gestión de publicaciones** con estados (borrador, programado, publicado) y soporte multi-plataforma
- **Banco de ideas** con prioridades y conversión directa a post
- **Calendario de eventos** del club (torneos, clases, sociales) con vista mensual
- **Datos de ejemplo** precargados automáticamente en el primer uso
- **Navegación dinámica** con sidebar compartido generado por JS
- **Modales y toasts** reutilizables para operaciones CRUD y feedback visual

---

## Stack tecnológico

| Capa          | Tecnología                              |
| ------------- | --------------------------------------- |
| Estructura    | HTML5 semántico                         |
| Estilos       | CSS3 (custom properties, flexbox, grid) |
| Lógica        | JavaScript vanilla (ES6+)              |
| Persistencia  | `localStorage` (JSON)                  |
| Dependencias  | Ninguna — zero frameworks, zero libs   |

### Decisiones técnicas destacables

- **Arquitectura sin backend**: los datos viven como arrays de objetos JSON en `localStorage`, con una capa `Storage` que abstrae la serialización.
- **Modelo relacional en frontend**: 5 entidades (Post, Idea, Event, Media, Task) con foreign keys entre ellas, evitando duplicación de datos.
- **Sidebar como componente JS**: en lugar de duplicar HTML entre páginas, `renderSidebar()` inyecta la navegación dinámicamente leyendo `data-page` del `<body>`.
- **Seed automático**: `seedIfEmpty()` carga datos de ejemplo si el `localStorage` está vacío, garantizando que la app nunca se vea vacía al abrirla por primera vez.
- **IDs únicos sin UUID**: generados con `timestamp + random base36`, suficiente para un entorno single-user sin colisiones.

---

## Cómo ejecutar

No requiere instalación, build ni servidor. Es HTML/CSS/JS puro.

```bash
# Opción 1: abrir directamente en el navegador
start pages/dashboard.html

# Opción 2: con un servidor local (evita restricciones de file://)
npx serve .
# Luego abrir http://localhost:3000
```

---

## Estructura del proyecto

```
tennis-club-social-manager/
├── index.html                  Redirect automático al dashboard
├── pages/
│   ├── dashboard.html          Dashboard con KPIs y resúmenes
│   ├── posts.html              CRUD completo de publicaciones (lista, filtros, modal, acciones)
│   ├── ideas.html              Banco de ideas (pendiente)
│   └── calendar.html           Calendario de eventos (pendiente)
├── scripts/
│   └── app.js                  Storage, seed, sidebar, modal/toast helpers, Posts CRUD + validación
├── styles/
│   └── style.css               Reset, layout, componentes (modal, toast, tabs, post-item, forms)
└── assets/
    └── icons/
```

---

## Capturas de pantalla

> Se agregarán capturas una vez completadas las pantallas principales.

<!--
### Dashboard
![Dashboard — vista general](docs/screenshots/dashboard.png)

### Publicaciones
![Publicaciones — lista con filtros](docs/screenshots/posts.png)

### Ideas
![Ideas — banco de ideas con prioridades](docs/screenshots/ideas.png)

### Calendario
![Calendario — vista mensual con eventos](docs/screenshots/calendar.png)
-->

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
| `status`        | `enum`          | `"idea"` · `"draft"` · `"scheduled"` · `"published"` |
| `platforms`     | `string[]`      | `["instagram","facebook"]`                   |
| `scheduledDate` | `string \| null`| ISO date, null si idea/draft                 |
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
| `tags`            | `string[]`      | Mismas etiquetas que Post                  |
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

### Media

| Campo      | Tipo       | Notas                              |
| ---------- | ---------- | ---------------------------------- |
| `id`       | `string`   |                                    |
| `fileName` | `string`   | Nombre original del archivo        |
| `url`      | `string`   | Path local o data-URL              |
| `type`     | `enum`     | `"image"` · `"video"`             |
| `caption`  | `string`   | Descripción breve                  |
| `tags`     | `string[]` |                                    |
| `createdAt`| `string`   |                                    |

### Task

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

### Dashboard (`pages/dashboard.html`)

| Sección                         | Datos                           | Fuente en app.js                     |
| ------------------------------- | ------------------------------- | ------------------------------------ |
| Stat: Posts este mes            | `Post[]` filtrados por mes      | `Posts.getThisMonth().length`        |
| Stat: Pendientes                | `Post[]` draft/scheduled        | `Posts.getPending().length`          |
| Stat: Ideas guardadas           | Total de `Idea[]`               | `Ideas.getAll().length`             |
| Stat: Próximos eventos          | `Event[]` fecha ≥ hoy           | `Events.getUpcoming().length`       |
| Lista: Próximas publicaciones   | Top 3 posts scheduled           | `Posts.getUpcoming(3)`              |
| Lista: Ideas recientes          | Top 3 ideas más nuevas          | `Ideas.getRecent(3)`               |
| Lista: Próximos eventos         | Top 3 eventos futuros           | `Events.getUpcoming(3)`            |

### Posts (`pages/posts.html`)

| Sección             | Datos                                           |
| ------------------- | ----------------------------------------------- |
| Filtros             | Valores únicos de `platforms`, `status`, `tags` |
| Lista de posts      | `Post[]` completo, filtrable                    |
| Formulario          | Un `Post` + `Media[]` + `Event`                 |
| Acciones            | Crear · Editar · Eliminar · Cambiar status      |

### Ideas (`pages/ideas.html`)

| Sección             | Datos                                           |
| ------------------- | ----------------------------------------------- |
| Filtros             | Valores únicos de `priority`, `status`          |
| Lista de ideas      | `Idea[]` completo, filtrable                    |
| Formulario          | Una `Idea`                                      |
| Acciones            | Crear · Editar · Eliminar · Convertir a Post    |

### Calendario (`pages/calendar.html`)

| Sección             | Datos                                           |
| ------------------- | ----------------------------------------------- |
| Grilla mensual      | `Event[]` + `Post[]` con scheduledDate          |
| Detalle del día     | Items del día seleccionado                      |
| Formulario          | Un `Event`                                      |
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

<details>
<summary><strong>Backlog de implementación (32 tareas / 5 sprints)</strong></summary>

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
| 14 | Crear HTML de `ideas.html`                               | ⬜     |
| 15 | Renderizar lista de ideas desde localStorage             | ⬜     |
| 16 | Formulario modal: crear idea nueva                       | ⬜     |
| 17 | Formulario modal: editar idea existente                  | ⬜     |
| 18 | Eliminar idea con confirm dialog                         | ⬜     |
| 19 | Convertir idea en post                                   | ⬜     |

### Sprint 4 — Página Calendario

| #  | Tarea                                                    | Estado |
| -- | -------------------------------------------------------- | ------ |
| 20 | Crear HTML de `calendar.html`                            | ⬜     |
| 21 | Renderizar grilla mensual                                | ⬜     |
| 22 | Navegación entre meses                                   | ⬜     |
| 23 | Mostrar eventos como dots en los días                    | ⬜     |
| 24 | Formulario modal: crear evento nuevo                     | ⬜     |
| 25 | Formulario modal: editar evento existente                | ⬜     |
| 26 | Eliminar evento con confirm dialog                       | ⬜     |
| 27 | Click en día → panel con detalle                         | ⬜     |

### Sprint 5 — Pulido + integración

| #  | Tarea                                                    | Estado |
| -- | -------------------------------------------------------- | ------ |
| 28 | Mostrar posts programados en el calendario               | ⬜     |
| 29 | Dashboard: links funcionales "Ver todas →"               | ⬜     |
| 30 | Fix bug: `p.platform` → `p.platforms`                    | ⬜     |
| 31 | Validación de formularios                                | ✅     |
| 32 | Test manual del flujo completo                           | ⬜     |

</details>

---

## Roadmap

| Fase | Descripción                    | Estado |
| ---- | ------------------------------ | ------ |
| 1    | Modelo de datos + mock data    | ✅     |
| 2    | Mapeo pantallas ↔ datos        | ✅     |
| 3    | Plan de funcionalidades MVP    | ✅     |
| 4    | Backlog de tareas              | ✅     |
| 5    | Implementación iterativa       | ⬜     |

### Fuera del alcance del MVP

Media (upload/galería) · Tasks (gestión de tareas) · Búsqueda global · Export/import de datos · Dark mode

---

## Autor

Desarrollado como proyecto personal para gestión real de redes sociales de un club de tenis.

## Licencia

MIT
