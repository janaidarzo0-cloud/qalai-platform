import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#f5f3ee',
    description: 'Қазақстандағы күнделікті істерді түсінікті қадамдармен шешіңіз.',
    display: 'standalone',
    lang: 'kk',
    name: 'QALAI',
    short_name: 'QALAI',
    start_url: '/',
    theme_color: '#f5f3ee',
  }
}
