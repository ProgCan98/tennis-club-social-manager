// Convierte una fecha ISO "YYYY-MM-DD" a formato legible "DD/MM/YYYY"
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const [year, month, day] = isoDate.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}
