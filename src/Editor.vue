<script setup lang="ts">
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import AngleInput from '@/components/AngleInput.vue';
import Autocomplete from '@/components/Autocomplete.vue';
import type { StyleRule, ValueType } from '@/types';
import { all as allCSSProperties } from 'known-css-properties';

allCSSProperties.sort();
const textMeasurementCanvas = document.createElement('canvas');

const valueTypes = new Map() as Map<RegExp, ValueType>;
valueTypes.set(/^[a-z]+/ui, { name: 'string', color: '#CE9178' });
valueTypes.set(/^[0-9]+deg$/ui, { name: 'angle', color: '#B5CEA8', additionalInput: 'angle' });
valueTypes.set(/^[0-9]+(?:[a-z]+|%)?$/ui, { name: 'number', color: '#B5CEA8' });
valueTypes.set(/^#[a-z0-9]+/ui, { name: 'color', color: '#CE91D0', additionalInput: 'color' });

const defaultValueType = { name: 'string', color: '#CE9178' };

export default defineComponent({
	name: 'Editor',
	components: {
		AngleInput,
		Autocomplete
	},
	data() {
		return {
			stylesheet: [] as StyleRule[],
			autocomplete: {
				suggestions: [] as string[],
				x: 0,
				y: 0
			}
		};
	},
	methods: {
		/**
		 * Determine the type of input field required to edit a particular value.
		 * @param value 
		 */
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
		/**
		 * Calculate the minimum width (in `ch`) required to display line numbers correctly.
		 */
		calculateLineNumbersWidth (): number {
			let width = 0;
			for (const rule of this.stylesheet) {
				width += 2;
				for (const property of rule.properties) {
					width++;
				}
			}
			return width.toString().length + 2;
		},
		/**
		 * Move focus to a perticular input field.
		 * @param styleIndex 
		 * @param propertyIndex 
		 * @param valueIndex 
		 */
		focusInput (styleIndex: number, propertyIndex?: number, valueIndex?: number): void {
			let ref = `selector-${styleIndex}`;
			if (typeof propertyIndex === 'number') {
				ref += `-property-${propertyIndex}`;
			}
			if (typeof valueIndex === 'number') {
				ref += `-value-${valueIndex}`;
			}
			const elem = this.$refs[ref] as HTMLInputElement[] | undefined;
			elem?.[0]?.focus();
		},
		/**
		 * Create a new style rule at the specified index in the stylesheet.
		 * @param index
		 */
		newStyle (index?: number): void {
			const style = {
				selector: '',
				properties: []
			};
			if (typeof index === 'number') {
				this.stylesheet.splice(index, 0, style);
				// Switch focus to the new style rule's selector input.
				this.$nextTick(() => {
					this.focusInput(index);
				});
				return;
			}
			this.stylesheet.push(style);
		},
		/**
		 * Remove a style rule from the specified index in the stylesheet.
		 * @param index
		 */
		deleteStyle (index: number): void {
			if (index <= 0) {
				return;
			}
			this.stylesheet.splice(index, 1);
			// Switch focus to the previous property's value input.
			this.$nextTick(() => {
				this.focusInput(
					index - 1,
					Math.max(this.stylesheet[index - 1].properties.length - 1, 0),
					Math.max(this.stylesheet[index - 1].properties[Math.max(this.stylesheet[index - 1].properties.length - 1, 0)].values.length - 1, 0)
				);
			});
			return;
		},
		/**
		 * Add a new property at the specified `propertyIndex` to a style rule at `styleIndex`.
		 * @param styleIndex
		 * @param propertyIndex
		 */
		newProperty (styleIndex: number, propertyIndex?: number): void {
			const property = {
				key: '',
				values: ['']
			};
			if (typeof propertyIndex === 'number') {
				this.stylesheet[styleIndex]?.properties.splice(propertyIndex, 0, property);
				// Switch focus to the new property's key input.
				this.$nextTick(() => {
					this.focusInput(styleIndex, propertyIndex);
				});
				return;
			}
			this.stylesheet[styleIndex]?.properties.push(property);
		},
		/**
		 * Remove a property at the specified `propertyIndex` from a style rule at `styleIndex`.
		 * @param styleIndex
		 * @param propertyIndex
		 */
		deleteProperty (styleIndex: number, propertyIndex: number): void {
			this.stylesheet[styleIndex]?.properties.splice(propertyIndex, 1);
			// Switch focus to the previous property's value input.
			this.$nextTick(() => {
				this.focusInput(
					styleIndex,
					propertyIndex > 0 ? propertyIndex - 1 : undefined,
					propertyIndex > 0 ? this.stylesheet[styleIndex].properties[propertyIndex - 1].values.length - 1 : undefined
				);
			});
			return;
		},
		/**
		 * Add a new value at the specified `valueIndex` to a property at `propertyIndex` of a style rule at `styleIndex`.
		 * @param styleIndex
		 * @param propertyIndex
		 * @param valueIndex
		 */
		newValue (styleIndex: number, propertyIndex: number, valueIndex?: number): void {
			if (typeof valueIndex === 'number') {
				this.stylesheet[styleIndex]?.properties[propertyIndex].values.splice(valueIndex, 0, '');
				// Switch focus to the new value's input.
				this.$nextTick(() => {
					this.focusInput(styleIndex, propertyIndex, valueIndex);
				});
				return;
			}
			this.stylesheet[styleIndex]?.properties[propertyIndex].values.push('');
		},
		/**
		 * Remove a value at the specified `valueIndex` from a property at `propertyIndex` of a style rule at `styleIndex`.
		 * @param styleIndex 
		 * @param propertyIndex 
		 * @param valueIndex 
		 */
		deleteValue (styleIndex: number, propertyIndex: number, valueIndex: number): void {
			if (valueIndex <= 0) {
				return;
			}
			this.stylesheet[styleIndex].properties[propertyIndex].values.splice(valueIndex, 1);
			// Switch focus to the previous value's input.
			this.$nextTick(() => {
				this.focusInput(
					styleIndex,
					propertyIndex,
					valueIndex - 1
				);
			});
		},
		/**
		 * Get the width (in px) for a given text string.
		 * (Assumes `monospace` font-family).
		 * @param text
		 */
		getTextWidth(text: string): number {
			let context = textMeasurementCanvas.getContext('2d');
			if (!context) {
				return 0;
			}
			context.font = 'monospace';
			let metrics = context.measureText(text);
			return metrics.width;
		},
		/**
		 * Update the autocomplete box.
		 * @param search The string to complete.
		 * @param element The input element that the autocomplete box should follow.
		 */
		autocompleteSearch (search?: string, element?: HTMLInputElement): void {
			if (!search || search?.length <= 0 || !element) {
				this.autocomplete.suggestions = [];
				return;
			}
			this.autocomplete.suggestions = allCSSProperties.filter((value) => value.includes(search)).sort((a, b) => b.startsWith('-') ? -1 : 1);

			this.autocomplete.x = element.offsetLeft + this.getTextWidth(search);
			this.autocomplete.y = element.offsetTop + element.offsetHeight;
		}
	},
	mounted () {
		if (this.stylesheet.length <= 0) {
			this.stylesheet.push({
				selector: '',
				properties: []
			});
			this.$nextTick(() => {
				this.focusInput(0);
			});
		}
	}
});
</script>

<template>
	<div class="editor" :style="`--line-number-gutter-width: ${calculateLineNumbersWidth()}ch;`">
		<div v-for="rule, styleIndex in stylesheet" class="rule">
			<span class="selector">
				<input
					:ref="`selector-${styleIndex}`"
					type="text"
					style="color: inherit;"
					:style="{
						width: `${rule.selector.length}ch`
					}"
					v-model="rule.selector"
					@input="autocompleteSearch(($event.target as HTMLInputElement).value, ($event.target as HTMLInputElement))"
					@keypress.enter="newProperty(styleIndex, 0), autocompleteSearch()"
					@keydown.backspace="rule.selector.length <= 0 ? deleteStyle(styleIndex) : undefined"
				>
			</span>&nbsp;{
			<div v-for="property, propertyIndex in rule.properties" class="property">
				<input
					:ref="`selector-${styleIndex}-property-${propertyIndex}`"
					type="text"
					class="key"
					:style="{
						width: `${property.key.length}ch`
					}"
					v-model="property.key"
					@keypress.enter="focusInput(styleIndex, propertyIndex, 0)"
					@keydown.backspace="property.key.length <= 0 ? deleteProperty(styleIndex, propertyIndex) : undefined"
				>:
				<template v-for="string, valueIndex of property.values">
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
							v-model="property.values[valueIndex]"
						>
					</span>
					<input
						:ref="`selector-${styleIndex}-property-${propertyIndex}-value-${valueIndex}`"
						type="text"
						class="value"
						:style="{
							width: `${string.length}ch`,
							color: getValueType(string).color
						}"
						v-model="property.values[valueIndex]"
						@keypress.enter="valueIndex < property.values.length - 1 ? focusInput(styleIndex, propertyIndex, valueIndex + 1) : newProperty(styleIndex, propertyIndex + 1)"
						@keydown.backspace="string.length <= 0 ? valueIndex > 0 ? deleteValue(styleIndex, propertyIndex, valueIndex) : focusInput(styleIndex, propertyIndex) : undefined"
						@keydown.space.prevent="newValue(styleIndex, propertyIndex, valueIndex + 1)"
					>
				</template>;
			</div>
			<br v-if="rule.properties.length <= 0">
			<button style="margin-left: 4ch;" @click.stop="newProperty(styleIndex, rule.properties.length)">+</button>
			<br>
			<span class="selectorClose">}</span>
			<br>
			<button @click.stop="newStyle(styleIndex + 1)">+</button>
		</div>

		<!-- <Autocomplete :suggestions="autocomplete.suggestions" :x="autocomplete.x" :y="autocomplete.y" @select="" /> -->
	</div>
</template>

<style scoped>
.editor {
	--line-number-gutter-width: 3ch;
	counter-reset: line-number;
	position: relative;
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
input:focus,
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

.rule {
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
	left: -0.9ch;
	width: var(--line-number-gutter-width);
	color: #888;
	text-align: right;
}

.selector {
	color: #D7BA7D;
}

.property {
	padding-left: 4ch;
}

.key {
	color: #9CDCFE;
}

button {
	min-width: 7ch;
	margin: 0.3rem 0;
	color: #8885;
	background: transparent;
	border: 1px solid #8882;
	border-radius: 5px;
	cursor: pointer;
}
button:hover {
	color: #fff;
	border-color: #888;
}
</style>
