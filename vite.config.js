import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  root: 'public',
  // Disable default publicDir (would be public/public). Campaign images are
  // under public/assets/images and copied into dist via the plugin below.
  publicDir: false,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        property: resolve(__dirname, 'public/property/index.html'),
        properties: resolve(__dirname, 'public/properties/index.html'),
        agents: resolve(__dirname, 'public/agents/index.html'),
        about: resolve(__dirname, 'public/about/index.html'),
        contact: resolve(__dirname, 'public/contact/index.html'),
        admin: resolve(__dirname, 'public/admin/index.html'),
        adminDashboard: resolve(__dirname, 'public/admin/dashboard.html'),
        notFound: resolve(__dirname, 'public/404.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
      '/sitemap.xml': 'http://localhost:5000',
      '/robots.txt': 'http://localhost:5000',
    },
  },
  plugins: [
    {
      name: 'copy-campaign-images',
      closeBundle() {
        const src = resolve(__dirname, 'public/assets/images');
        const dest = resolve(__dirname, 'dist/assets/images');
        if (!existsSync(src)) return;
        mkdirSync(dest, { recursive: true });
        cpSync(src, dest, { recursive: true });
      },
    },
    {
      name: 'astoria-404-fallback',
      configureServer(server) {
        const publicRoutes = new Set([
          '/property',
          '/property/',
          '/properties',
          '/properties/',
          '/agents',
          '/agents/',
          '/about',
          '/about/',
          '/contact',
          '/contact/',
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
            url.startsWith('/properties/') ||
            url.startsWith('/agents/') ||
            url.startsWith('/about/') ||
            url.startsWith('/contact/') ||
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
