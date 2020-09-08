import { Schema, model } from 'mongoose'
import { categorySchema, productSchema } from './schema'

const sellerSchema = new Schema(
	{
		company: { type: String, required: true },
		owner: { type: String, required: true },
		loginNumber: {
			type: String,
			unique: true,
			required: [true, 'Login Number is mandatory'],
			immutable: true,
			match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
		},
		email: { type: String, required: true },
		emailVerified: { type: Boolean, default: false },
		motto: String,
		imageUrl: String,
		address: {
			address1: { type: String, required: true },
			address2: String,
			area: { type: String, required: true },
			city: { type: String, required: true },
			state: { type: String, required: true },
			pincode: { type: String, required: true, match: [/^\d{6}/] }
		},
		categories: [categorySchema],
		products: [productSchema]
	},
	{ timestamps: true }
)

export const Seller = model('seller', sellerSchema)
