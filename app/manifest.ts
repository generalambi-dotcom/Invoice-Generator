import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Invoice Generator Nigeria',
        short_name: 'InvoiceGen NG',
        description: 'Free Online Invoice Creator for Nigerian Businesses',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#115e59',
        icons: [
            {
                src: '/icon',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon?size=512',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
