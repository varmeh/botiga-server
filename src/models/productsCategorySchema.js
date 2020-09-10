import { Schema } from 'mongoose'
import { productSchema } from './productSchema'

// Each subdocument has an _id by default
export const productsCategorySchema = new Schema({
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
