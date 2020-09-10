import { Schema } from 'mongoose'

export const productSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	description: {
		type: String,
		trim: true,
		maxlength: 140
	},
	price: {
		type: Number,
		min: 0.0,
		required: true
	},
	size: {
		type: String,
		trim: true,
		required: true,
		maxlength: 32
	},
	available: {
		type: Boolean,
		default: true
	},
	imageUrl: {
		type: String,
		trim: true
	}
})
