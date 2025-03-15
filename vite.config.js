import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // Base raíz, ya que se sirve en el subdominio
  plugins: [react()]
});
