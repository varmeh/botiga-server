import { Schema } from 'mongoose'
import { productSchema } from './productSchema'

// Each subdocument has an _id by default
export const categorySchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		maxlength: 32
	},
	visible: {
		type: Boolean,
		default: true
	},
	products: [productSchema]
})

categorySchema.virtual('productCount').get(function () {
	return this.products.length
})
