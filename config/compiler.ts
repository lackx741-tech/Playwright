export interface CompilerConfig {
  format: 'esm' | 'iife';
  minify: boolean;
  sourceMap: boolean;
  target: string;
  bundleName: string;
}

export const compilerConfig: CompilerConfig = {
  format: 'esm',
  minify: false,
  sourceMap: true,
  target: 'es2022',
  bundleName: 'pageforgex.bundle',
};
