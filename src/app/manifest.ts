
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Careingo',
    short_name: 'Careingo',
    description: 'كارينجو | تواصل، تحدى، تطور',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['health', 'lifestyle', 'education'],
    display_override: ['window-controls-overlay', 'minimal-ui'],
    orientation: 'portrait',
  }
}
