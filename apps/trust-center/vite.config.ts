import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function normalizeViteBase(p: string | undefined): string {
  if (!p || p === '/') return '/';
  if (p.includes('Program Files')) {
    throw new Error('MSYS2 path corruption detected on BASE_PATH: ' + p + '. Use PowerShell to build.');
  }
  return p.replace(/\/$/, '') + '/';
}

const rootDomain = process.env.PLATFORM_ROOT_DOMAIN || (process.env.VITE_OAUTH_CLIENT_ID ? 'iam.tianv.local' : 'iam.tianv.com');
const SITE_BASE_URL = process.env.VITE_OAUTH_CLIENT_ID ? `http://${rootDomain}` : `https://${rootDomain}`;

function domainPlugin(): Plugin {
  return {
    name: 'domain-plugin',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replaceAll('https://iam.tianv.com', SITE_BASE_URL);
    },
  };
}

export default defineConfig({
  plugins: [react(), domainPlugin()],
  base: normalizeViteBase(process.env.BASE_PATH),
  resolve: {
    extensions: ['.mjs', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {'@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 13109,
    proxy: {
      '/bff': {
        target: process.env.VITE_API_PROXY_URL || 'http://localhost:11080',
        changeOrigin: true,
      },
      '/oauth/': {
        target: process.env.VITE_API_PROXY_URL || 'http://localhost:11080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 13109,
    proxy: {
      '/bff': {
        target: process.env.VITE_API_PROXY_URL || 'http://localhost:11080',
        changeOrigin: true,
      },
      '/oauth/': {
        target: process.env.VITE_API_PROXY_URL || 'http://localhost:11080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
