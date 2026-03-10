import {defineConfig, defineProject, } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import { loadEnvFile } from 'process';

loadEnvFile()

export default defineProject({
    plugins: [tsconfigPaths(), react()],
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: 'node',
                    environment: 'node',
                    include: ['**/tests/**/*.test.ts']
                }
            },
            {
                extends: true,
                test: {
                    name: 'react',
                    environment: 'jsdom',
                    include: ['**/tests/**/*.test.tsx']
                }
            }
        ]
    }
})
