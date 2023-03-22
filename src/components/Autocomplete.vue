<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
	name: 'Autocomplete',
	props: {
		suggestions: { type: Array as PropType<string[]>, required: true },
		x: { type: Number, required: false },
		y: { type: Number, required: false }
	},
	emits: ['select']
});
</script>

<template>
	<ul
		v-if="suggestions.length > 0"
		class="autocomplete"
		:style="{ top: `${y}px`, left: `${x}px` }"
	>
		<li
			v-for="suggestion of suggestions"
		>
			<button @click.stop="$emit('select', )">{{ suggestion }}</button>
		</li>
	</ul>
</template>

<style>
.autocomplete {
	position: fixed;
	display: flex;
	flex-flow: column nowrap;
	width: 30ch;
	min-width: 10ch;
	margin: 0;
	padding: 0;
	list-style: none;
	background-color: #252526;
	border-radius: 5px;
}

.autocomplete > li {
	padding: 0;
}
.autocomplete > li:hover {
	background-color: #2d2d2e;
}
.autocomplete > li:first-of-type {
	border-radius: 5px 5px 0 0;
}
.autocomplete > li:last-of-type {
	border-radius: 0 0 5px 5px;
}

.autocomplete > li > button {
	color: inherit;
	text-overflow: ellipsis;
	white-space: nowrap;
	background: transparent;
	border: unset;
	overflow: hidden;
}
</style>
