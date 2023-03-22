interface Property {
	key: string,
	values: string[]
}

export interface StyleRule {
	selector: string,
	properties: Property[]
}

export interface ValueType {
	name: string,
	color: string,
	additionalInput?: string
}

export type UpdateCallback = (stylesheet: StyleRule[]) => void
