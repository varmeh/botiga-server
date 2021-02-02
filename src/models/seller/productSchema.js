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
		maxlength: 300
	},
	price: {
		type: Number,
		min: 0.0,
		required: true
	},
	mrp: {
		type: Number,
		min: 0.0
	},
	size: {
		quantity: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32
		},
		unit: {
			type: String,
			enum: ['gms', 'kg', 'ml', 'lt', 'piece', 'pieces'],
			required: true
		}
	},
	available: {
		type: Boolean,
		default: true
	},
	tag: {
		type: String,
		enum: ['', 'BestSeller', 'New', 'Recommended'],
		default: ''
	},
	imageUrl: {
		type: String,
		trim: true
	}
})

productSchema.virtual('sizeInfo').get(function () {
	return `${this.size.quantity} ${this.size.unit}`
})
