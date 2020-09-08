import { Schema } from 'mongoose'
import { nanoid } from 'nanoid'
import { categorySchema } from './categorySchema'

export const productSchema = new Schema({
	id: {
		type: String,
		default: () => nanoid(10)
	},
	name: {
		type: String,
		required: true
	},
	description: String,
	price: {
		type: Number,
		required: true
	},
	size: {
		type: String,
		required: true
	},
	available: {
		type: Boolean,
		default: true
	},
	category: categorySchema,
	imageUrl: String
})
