import { Schema } from 'mongoose'
import { nanoid } from 'nanoid'

export const categorySchema = new Schema({
	id: {
		type: String,
		default: () => nanoid(10)
	},
	name: {
		type: String,
		required: true
	},
	totalProducts: { type: Number, default: 0 }
})
