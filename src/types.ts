export class StyleProperty {
	key = '';
	values = [''];
}

export class StyleRule {
	selector = '';
	properties = new Array<StyleProperty>();
}

export interface ValueType {
	name: string;
	color: string;
	additionalInput?: string;
}

export type UpdateCallback = (stylesheet: Array<StyleRule>) => void;
