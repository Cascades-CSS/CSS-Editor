<script setup lang="ts">
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import AngleInput from './components/AngleInput.vue';

interface Property {
	key: string,
	value: string
}

interface Style {
	selector: string,
	properties: Property[]
}

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
			stylesheet: [] as Style[]
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
			for (const style of this.stylesheet) {
				width += 2;
				for (const property of style.properties) {
					width++;
				}
			}
			return width.toString().length + 2;
		},
		focusInput (styleIndex: number, propertyIndex?: number, valueIndex?: number): void {
			let ref = `selector-${styleIndex}`;
			if (typeof propertyIndex === 'number') {
				ref += `-property-${propertyIndex}`;
			}
			if (typeof valueIndex === 'number') {
				ref += `-value-${valueIndex}`;
			}
			console.log(ref);
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
				// Switch focus to the new style's selector input.
				this.$nextTick(() => {
					this.focusInput(index);
				});
				return;
			}
			this.stylesheet.push(style);
		},
		/**
		 * Add a new style property at the specified index to a given style rule in the stylesheet.
		 * @param styleIndex
		 * @param propertyIndex
		 */
		newProperty (styleIndex: number, propertyIndex?: number): void {
			const property = {
				key: '',
				value: ''
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
		 * Remove a style property at the specified index from a given style rule in the stylesheet.
		 * @param styleIndex
		 * @param propertyIndex
		 */
		deleteProperty (styleIndex: number, propertyIndex: number): void {
			this.stylesheet[styleIndex]?.properties.splice(propertyIndex, 1);
			// Switch focus to the previous property's key input.
			this.$nextTick(() => {
				this.focusInput(styleIndex, propertyIndex > 0 ? propertyIndex - 1 : undefined);
			});
			return;
		}
	}
});
</script>

<template>
	<div class="editor" :style="`--line-number-gutter-width: ${calculateLineNumbersWidth()}ch;`">
		<button @click.stop="newStyle(0)">+</button>
		<div v-for="style, styleIndex in stylesheet" class="style">
			<span class="selector">
				<input
					:ref="`selector-${styleIndex}`"
					type="text"
					style="color: inherit;"
					:style="{
						width: `${style.selector.length}ch`
					}"
					v-model="style.selector"
					@keypress.enter="newProperty(styleIndex, 0)"
				>
			</span>&nbsp;{
			<div v-for="property, propertyIndex in style.properties" class="property">
				<input
					:ref="`selector-${styleIndex}-property-${propertyIndex}`"
					type="text"
					class="key"
					:style="{
						width: `${property.key.length}ch`
					}"
					v-model="property.key"
					@keypress.enter="focusInput(styleIndex, propertyIndex, 0)"
					@keydown.backspace="deleteProperty(styleIndex, propertyIndex)"
				>:
				<template v-for="string, valueIndex of property.value.split(' ')">
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
						:ref="`selector-${styleIndex}-property-${propertyIndex}-value-${valueIndex}`"
						type="text"
						class="value"
						:style="{
							width: `${string.length}ch`,
							color: getValueType(string).color
						}"
						:value="string"
						@keypress.enter="newProperty(styleIndex, propertyIndex + 1)"
					>
				</template>;
				<template v-if="style.properties.length <= 0">
					<br>
					<button @click.stop="newProperty(styleIndex, 0)"></button>
					<br>
				</template>
			</div>
			<span class="selectorClose">}</span>
			<br>
			<button @click.stop="newStyle(styleIndex)">+</button>
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
