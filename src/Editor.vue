<script setup lang="ts">
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import AngleInput from './components/AngleInput.vue';

interface ValueType {
	name: string,
	color: string,
	additionalInput?: string
}
const valueTypes = new Map() as Map<RegExp, ValueType>;
valueTypes.set(/^[a-z]+/ui, { name: 'string', color: '#CE9178' });
valueTypes.set(/^[0-9]+deg$/ui, { name: 'angle', color: '#B5CEA8', additionalInput: 'angle' });
valueTypes.set(/^[0-9]+(?:[a-z]+|%)?$/ui, { name: 'number', color: '#B5CEA8' });
valueTypes.set(/^#[a-z0-9]+/ui, { name: 'color', color: '#CE91D0', additionalInput: 'color' });

const defaultValueType = { name: 'string', color: '#CE9178' };

export default defineComponent({
	name: 'Editor',
	components: {
		AngleInput
	},
	data() {
		return {
			css: {
				'.style-1': {
					'display': 'block',
					'width': '200px',
					'height': '400px',
					'border': '1px solid #ff0000'
				},
				'.style-2': {
					'border': '1px solid red',
					'angle': '60deg'
				}
			} as { [key: string]: { [key: string]: string } }
		};
	},
	methods: {
		getValueType (value: string): ValueType {
			let output = defaultValueType;
			for (const [expression, entry] of valueTypes) {
				if (expression.test(value)) {
					output = entry;
					break;
				}
			}
			return output;
		},
		calculateLineNumbersWidth (): number {
			let width = 0;
			for (const style of Object.values(this.css)) {
				width += 2;
				for (const property of Object.values(style)) {
					width++;
				}
			}
			return width.toString().length + 2;
		}
	}
});
</script>

<template>
	<div class="editor" :style="`--line-number-gutter-width: ${calculateLineNumbersWidth()}ch;`">
		<div v-for="[selector, properties] of Object.entries(css)" class="style">
			<span class="selector">
				<input
					type="text"
					style="color: inherit;"
					:style="{
						width: `${selector.length}ch`
					}"
					:value="selector"
				>
			</span>&nbsp;{
			<div v-for="[key, value] of Object.entries(properties)" class="property">
				<input
					type="text"
					class="key"
					:style="{
						width: `${key.length}ch`
					}"
					:value="key"
				>:
				<template v-for="string of value.split(' ')">
					<span
						v-if="getValueType(string).additionalInput"
						class="additionalInput"
					>
						<AngleInput
							v-if="getValueType(string).additionalInput === 'angle'"
							:modelValue="0"
						/>
						<input
							v-else
							:type="getValueType(string).additionalInput"
							:value="string"
						>
					</span>
					<input
						type="text"
						class="value"
						:style="{
							width: `${string.length}ch`,
							color: getValueType(string).color
						}"
						:value="string"
					>
				</template>;
			</div>
			<br v-if="Object.entries(properties).length <= 0">
			<span class="selectorClose">}</span>
		</div>
	</div>
</template>

<style scoped>
.editor {
	--line-number-gutter-width: 3ch;
	counter-reset: line-number;
	display: flex;
	flex-flow: column nowrap;
	color: white;
	font-family: monospace;
	background-color: var(--color-background-dark);
	border: 1px solid #8888;
}

input[type="text"] {
	min-width: 3ch;
	font-family: inherit;
	background: transparent;
	border: 1px solid #8880;
	border-radius: 3px;
	outline: unset;
}

input[type="color"] {
	width: 1.5em;
	height: 1.8em;
	padding: unset;
	background: transparent;
	border: 1px solid #8880;
	border-radius: 3px;
	outline: unset;
}

input:hover {
	border: 1px solid #8886;
}
input:focus-within {
	border: 1px solid #888;
}

.additionalInput {
	position: relative;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 1.5em;
	height: 1em;
}
.additionalInput > input {
	position: absolute;
	transform: translateY(0.15em);
}

.style {
	margin-left: var(--line-number-gutter-width);
	padding: 1ch;
	border-left: 1px solid #888;
}

.selector::before,
.selectorClose::before,
.property::before {
	counter-increment: line-number;
	content: counter(line-number);
	position: absolute;
	left: 0.5ch;
	width: var(--line-number-gutter-width);
	color: #888;
	text-align: right;
}

.selector {
	color: #D7BA7D;
}

.selectorClose {
}

.property {
	padding-left: 4ch;
}

.key {
	color: #9CDCFE;
}
</style>
