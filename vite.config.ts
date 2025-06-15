import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',  // 커스텀 도메인을 사용하므로 '/'로 변경
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
