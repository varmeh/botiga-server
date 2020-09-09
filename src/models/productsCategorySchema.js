import { Schema } from 'mongoose'
import { nanoid } from 'nanoid'
import { productSchema } from './productSchema'

export const productsCategorySchema = new Schema({
	id: {
		type: String,
		default: () => nanoid(10),
		immutable: true
	},
	name: {
		type: String,
		required: true,
		trim: true,
		maxlength: 32
	},
	products: [productSchema]
})

productsCategorySchema.virtual('productCount').get(function () {
	return this.products.length
})
