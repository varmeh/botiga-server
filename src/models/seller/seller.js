import { Schema, model } from 'mongoose'
import { categorySchema } from './categorySchema'
import { apartmentManagementSchema } from './apartmentManagementSchema'

const sellerSchema = new Schema(
	{
		companyName: { type: String, required: true },
		businessCategory: String,
		owner: {
			firstName: {
				type: String,
				required: true,
				trim: true
			},
			lastName: {
				type: String,
				required: true,
				trim: true
			},
			gender: {
				type: String,
				required: true,
				enum: ['male', 'female']
			}
		},
		brand: {
			name: { type: String, required: true },
			tagline: String,
			imageUrl: String
		},
		pin: { type: String, required: true },
		contact: {
			email: String,
			phone: {
				type: String,
				unique: true,
				required: [true, 'phone number is mandatory'],
				immutable: true,
				match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
			},
			whatsapp: {
				type: String,
				required: [true, 'Whatsapp Number is mandatory'],
				match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number']
			},
			address: {
				address1: String,
				address2: String,
				area: String,
				city: String,
				state: String,
				pincode: { type: String, match: [/^\d{6}/] }
			}
		},
		categories: [categorySchema],
		apartments: [apartmentManagementSchema]
	},
	{ timestamps: true }
)

export const Seller = model('seller', sellerSchema)
