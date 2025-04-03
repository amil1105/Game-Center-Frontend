import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'GameCenterCore',
      formats: ['es', 'umd'],
      fileName: (format) => `game-center-core.${format}.js`
    },
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react-dom', '@emotion/react', '@emotion/styled', '@mui/material'],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@emotion/react': 'emotionReact',
          '@emotion/styled': 'emotionStyled',
          '@mui/material': 'MaterialUI'
        }
      }
    }
  }
}); 