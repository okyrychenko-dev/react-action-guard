import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'react-router/index': 'src/react-router/index.ts',
    'tanstack-router/index': 'src/tanstack-router/index.ts',
    'nextjs/index': 'src/nextjs/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    '@tanstack/react-router',
    'next',
    '@okyrychenko-dev/react-action-guard',
    'zustand',
  ],
});
