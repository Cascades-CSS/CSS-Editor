import { createApp } from 'vue';
import Editor from './Editor.vue';

import './assets/base.css';

export class CSSEditor {
	private app;
	public editor;

	constructor (element: string) {
		this.app = createApp(Editor);
		this.editor = this.app.mount(element);
		Editor.watch
	}
}
