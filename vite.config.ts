import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import type { BuildOptions } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from "vite-plugin-dts";

const prodBuild: BuildOptions = {
	sourcemap: true
};

const devBuild: BuildOptions = {
	sourcemap: true,
	lib: {
		entry: resolve(__dirname, 'src/index.ts'),
		name: 'CSSEditor',
		fileName: 'index',
	},
	rollupOptions: {
		output: {
			chunkFileNames: '[name].js'
		}
	}
};

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		dts({
			insertTypesEntry: true,
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	build: process.env.NODE_ENV === 'production' ? prodBuild : devBuild
});
