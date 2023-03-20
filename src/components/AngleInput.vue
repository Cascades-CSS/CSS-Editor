<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'AngleInput',
	props: {
		modelValue: { type: Number, required: true }
	},
	emits: ['update:modelValue']
});
</script>

<template>
	<div class="angleInput">
		<input type="number" :value="modelValue" @input="$emit('update:modelValue')">
		<div class="gizmo">
			<span class="background"></span>
			<span class="arm"></span>
		</div>
	</div>
</template>

<style scoped>
.angleInput {
	position: relative;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 1.5em;
	height: 1.5em;
	color: white;
	transform: translateY(25%);
}
.angleInput:hover,
.angleInput:focus-within {
	transform: translateY(25%) scale(3);
}

.angleInput > input[type="number"] {
	position: absolute;
	z-index: 1;
	width: 0.5em;
	font-size: 0.25em;
}

.angleInput > .gizmo {
	position: absolute;
	z-index: 2;
	inset: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--color-background-dark);
	transform-origin: center;
}

.angleInput > .gizmo > .background {
	position: absolute;
	inset: 0;
	display: block;
	background:
		radial-gradient(circle at center, #888 1px, transparent 1.25px),
		radial-gradient(circle at center, #888 1px, transparent 1.25px),
		radial-gradient(circle at center, #888 1px, transparent 1.25px),
		radial-gradient(circle at center, #888 1px, transparent 1.25px);
	background-position:
		0 -0.5em,
		0.5em 0,
		0 0.5em,
		-0.5em 0;
	border: 1px solid #888;
	border-radius: 50%;
}

.angleInput > .gizmo > .arm {
	position: absolute;
	inset: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	transform: rotate(0deg);
	transform-origin: center;
}
.angleInput > .gizmo > .arm::before {
	content: '';
	position: absolute;
	display: block;
	width: 0.1em;
	height: 0.65em;
	background-color: currentColor;
	border-radius: 0.1em;
	transform: translateY(-0.25em);
}
.angleInput > .gizmo > .arm::after {
	content: '';
	position: absolute;
	top: 0.5px;
	display: block;
	width: 0.3em;
	height: 0.3em;
	background-color: currentColor;
	border-radius: 50%;
}
</style>
