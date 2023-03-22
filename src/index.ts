import { createApp } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import Editor from '@/Editor.vue';
import '@/assets/base.css';
import type { StyleRule, UpdateCallback } from '@/types';

export class CSSEditor {
	private app;
	public editor;
	private internalStylesheet = [] as StyleRule[];
	private updateCallbacks = [] as (UpdateCallback | undefined)[];

	constructor (element: string) {
		this.app = createApp(Editor);
		this.editor = this.app.mount(element) as ComponentPublicInstance<{}, {}, { stylesheet: StyleRule[] }>;
		this.editor.$watch(() => this.editor.stylesheet , (stylesheet) => this.updateFromComponent(stylesheet), { deep: true });
	}

	get stylesheet (): StyleRule[] {
		return this.internalStylesheet;
	}

	set stylesheet (value: StyleRule[]) {
		this.internalStylesheet = value;
		this.editor.stylesheet = value;
	}

	/**
	 * Use a callback to listen to updates in the stylesheet.
	 * @param callback The callback. This will receive a copy of the stylesheet object.
	 * @returns The callback's ID.
	 */
	onUpdate (callback: UpdateCallback): number {
		return this.updateCallbacks.push(callback) - 1;
	}

	/**
	 * Stop a callback from listening to updates in the stylesheet.
	 * @param callbackId The ID of the callback.
	 */
	offUpdate (callbackId: number): void {
		this.updateCallbacks.splice(callbackId, 1, undefined);
	}

	/**
	 * Converts a stylesheet object into a CSS string.
	 * @param stylesheet (Optional) A stylesheet object. If none is passed, the internal stylesheet is stringified.
	 * @returns An equivalent CSS string.
	 */
	stringify (stylesheet?: StyleRule[]): string {
		let output = '';
		for (const rule of stylesheet ?? this.internalStylesheet) {
			output += `${rule.selector} {\n`;
			for (const property of rule.properties) {
				output += `${property.key}: ${property.values.join(' ')};`;
			}
			output += '}\n';
		}
		return output;
	}

	/**
	 * Converts a CSS string into a stylesheet object.
	 * @param string A valid CSS string.
	 * @returns An equivalent stylesheet object.
	 */
	static parse (string: string): StyleRule[] {
		const output = [] as StyleRule[];

		const rules = string.matchAll(/([^\{]+)\{([^\}]+)*\}/gmui);
	
		for (const rule of rules) {
			if (!rule[1]) continue;
	
			const properties = [];
	
			for (const prop of rule[2]?.split(';') ?? []) {
				const key = prop.split(':')[0]?.trim().replace('\n', '');
				const values = prop.split(':')[1]?.trim().replace('\n', '').split(' ');

				if (!key || !values) continue;

				properties.push({
					key,
					values
				});
			}
	
			output.push({
				selector: rule[1]?.trim().replace('\n', ''),
				properties
			});
		}
	
		return output;
	}

	private updateFromComponent (stylesheet: StyleRule[]): void {
		this.internalStylesheet = stylesheet;
		for (const callback of this.updateCallbacks) {
			void callback?.(stylesheet);
		}
	}
}
