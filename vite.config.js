import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        property: resolve(__dirname, 'public/property/index.html'),
        admin: resolve(__dirname, 'public/admin/index.html'),
        adminDashboard: resolve(__dirname, 'public/admin/dashboard.html'),
        notFound: resolve(__dirname, 'public/404.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    proxy: {
      '/api': 'http://127.0.0.1:5000',
      '/uploads': 'http://127.0.0.1:5000',
      '/sitemap.xml': 'http://127.0.0.1:5000',
      '/robots.txt': 'http://127.0.0.1:5000',
    },
  },
  plugins: [
    {
      name: 'astoria-404-fallback',
      configureServer(server) {
        const publicRoutes = new Set([
          '/property',
          '/property/',
          '/admin',
          '/admin/',
          '/404.html',
        ]);
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] || '';
          if (
            url.startsWith('/api') ||
            url.startsWith('/@') ||
            url.startsWith('/uploads') ||
            url.startsWith('/theme_css') ||
            url.startsWith('/js/') ||
            url.startsWith('/features') ||
            url.includes('.') ||
            url === '/' ||
            publicRoutes.has(url) ||
            url.startsWith('/property/') ||
            url.startsWith('/admin/')
          ) {
            return next();
          }
          req.url = '/404.html';
          next();
        });
      },
    },
  ],
});
