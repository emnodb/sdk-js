import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  cjsInterop: true,
  minify: true,
  bundle: true,
  watch: false,
  target: 'es2020',
  outDir: 'dist',
  noExternal: [],
});
