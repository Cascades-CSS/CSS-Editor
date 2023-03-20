interface Property {
	key: string,
	value: string
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
