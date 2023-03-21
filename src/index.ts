import { createApp } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import Editor from '@/Editor.vue';
import '@/assets/base.css';
import type { StyleRule } from '@/types';

export class CSSEditor {
	private app;
	public editor;
	private internalStylesheet = [] as StyleRule[];
	private updateCallbacks = [] as (UpdateCallback | undefined)[];

	constructor (element: string) {
		this.app = createApp(Editor);
		this.editor = this.app.mount(element) as ComponentPublicInstance<{}, {}, { stylesheet: StyleRule[] }>;
		this.editor.$watch('stylesheet', (stylesheet) => this.updateFromComponent(stylesheet));
	}

	get stylesheet (): StyleRule[] {
		return this.internalStylesheet;
	}

	set stylesheet (value: StyleRule[]) {
		this.internalStylesheet = value;
	}

	onUpdate (callback: UpdateCallback): number {
		return this.updateCallbacks.push(callback) - 1;
	}

	offUpdate (callbackId: number): void {
		this.updateCallbacks.splice(callbackId, 1, undefined);
	}

	private updateFromComponent (stylesheet: StyleRule[]): void {
		this.internalStylesheet = stylesheet;
		for (const callback of this.updateCallbacks) {
			void callback?.(this.stringify(stylesheet));
		}
	}
}
