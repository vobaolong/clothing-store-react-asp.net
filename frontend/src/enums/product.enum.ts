export const ProductSize = {
	XS: 'XS',
	S: 'S',
	M: 'M',
	L: 'L',
	XL: 'XL',
	XXL: '2XL',
	XXXL: '3XL',
	XXXXL: '4XL'
} as const

export type ProductSize = (typeof ProductSize)[keyof typeof ProductSize]

export const ProductShoeSize = {
	SIZE_34: '34',
	SIZE_35: '35',
	SIZE_36: '36',
	SIZE_37: '37',
	SIZE_38: '38',
	SIZE_39: '39',
	SIZE_40: '40',
	SIZE_41: '41',
	SIZE_42: '42',
	SIZE_43: '43'
} as const

export type ProductShoeSize = (typeof ProductShoeSize)[keyof typeof ProductShoeSize]

export const HomeTabKey = {
	ALL: 'all',
	NEW: 'new',
	SALE: 'sale'
} as const

export type HomeTabKey = (typeof HomeTabKey)[keyof typeof HomeTabKey]
