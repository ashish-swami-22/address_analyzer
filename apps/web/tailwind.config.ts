import type { Config } from 'tailwindcss';
export default { content: ['./index.html', './src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#102a43', teal: '#0f766e', sand: '#f7f8f6' } } }, plugins: [] } satisfies Config;
