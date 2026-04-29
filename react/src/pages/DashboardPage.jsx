import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import usePosts from '../hooks/usePosts'
import useIdeas from '../hooks/useIdeas'
import useEvents from '../hooks/useEvents'
import { formatDate } from '../lib/data'

function DashboardPage() {
  const { posts,  refresh: refreshPosts  } = usePosts()
  const { ideas,  refresh: refreshIdeas  } = useIdeas()
  const { events, refresh: refreshEvents } = useEvents()

  useEffect(() => {
    refreshPosts()
    refreshIdeas()
    refreshEvents()
  }, [refreshPosts, refreshIdeas, refreshEvents])

  const today = new Date().toISOString().split('T')[0]
  const thisMonth = today.slice(0, 7)

  const postsThisMonth = posts.filter(p => p.scheduledDate && p.scheduledDate.startsWith(thisMonth))
  const postsPending   = posts.filter(p => p.status === 'draft' || p.status === 'scheduled')
  const upcomingPosts  = posts
    .filter(p => p.scheduledDate && p.scheduledDate >= today)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 5)
  const upcomingEvents = events
    .filter(e => e.date && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
  const recentIdeas = ideas
    .slice()
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 5)

  return (
    <Layout title="Bienvenido 👋" activePage="dashboard">

      {/* KPIs */}
      <section className="section" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="section__title">Resumen</h2>
        <div className="cards-grid">
          <article className="card card--stat">
            <h3 className="card__label">Publicaciones este mes</h3>
            <p className="card__value">{postsThisMonth.length}</p>
          </article>
          <article className="card card--stat">
            <h3 className="card__label">Pendientes de publicar</h3>
            <p className="card__value">{postsPending.length}</p>
          </article>
          <article className="card card--stat">
            <h3 className="card__label">Ideas guardadas</h3>
            <p className="card__value">{ideas.length}</p>
          </article>
          <article className="card card--stat">
            <h3 className="card__label">Próximos eventos</h3>
            <p className="card__value">{upcomingEvents.length}</p>
          </article>
        </div>
      </section>

      {/* Próximas publicaciones */}
      <section className="section" aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="section__title">Próximas publicaciones</h2>
        <div className="section__header">
          <Link to="/posts" className="link--muted">Ver todas →</Link>
        </div>
        <ul className="posts-list">
          {upcomingPosts.length ? upcomingPosts.map(p => (
            <li key={p.id} className="list-item">
              <span className="list-item__date">{formatDate(p.scheduledDate)}</span>
              <span className="list-item__title">{p.title}</span>
              <span className="list-item__platforms">{(p.platforms ?? []).join(' · ')}</span>
            </li>
          )) : (
            <li className="posts-list__empty">No hay publicaciones programadas.</li>
          )}
        </ul>
      </section>

      {/* Ideas recientes */}
      <section className="section" aria-labelledby="ideas-heading">
        <h2 id="ideas-heading" className="section__title">Ideas recientes</h2>
        <div className="section__header">
          <Link to="/ideas" className="link--muted">Ver todas →</Link>
        </div>
        <ul className="ideas-list">
          {recentIdeas.length ? recentIdeas.map(i => (
            <li key={i.id} className="list-item">
              <span className="list-item__title">{i.title}</span>
              <span className={`list-item__badge list-item__badge--${i.priority}`}>{i.priority}</span>
            </li>
          )) : (
            <li className="ideas-list__empty">No hay ideas guardadas aún.</li>
          )}
        </ul>
      </section>

      {/* Próximos eventos */}
      <section className="section" aria-labelledby="events-heading">
        <h2 id="events-heading" className="section__title">Próximas fechas importantes</h2>
        <div className="section__header">
          <Link to="/calendar" className="link--muted">Ver calendario →</Link>
        </div>
        <ul className="events-list">
          {upcomingEvents.length ? upcomingEvents.map(e => (
            <li key={e.id} className="list-item">
              <span className="list-item__date">{formatDate(e.date)}</span>
              <span className="list-item__title">{e.title}</span>
              <span className="list-item__type">{e.type}</span>
            </li>
          )) : (
            <li className="events-list__empty">No hay eventos próximos.</li>
          )}
        </ul>
      </section>

    </Layout>
  )
}

export default DashboardPage
