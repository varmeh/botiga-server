import { Schema, model } from 'mongoose'
import { productsCategorySchema } from './productsCategorySchema'
import { apartmentManagementSchema } from './apartmentManagementSchema'

const sellerSchema = new Schema(
	{
		name: { type: String, required: true },
		businessType: [String],
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
				enum: ['m', 'f'],
				default: 'm',
				maxlength: 1
			}
		},
		companyInfo: {
			tagline: String,
			imageUrl: String
		},
		contactInfo: {
			email: { type: String, required: true },
			loginNumber: {
				type: String,
				unique: true,
				required: [true, 'Login Number is mandatory'],
				immutable: true,
				match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
			},
			whatsappNumber: {
				type: String,
				required: [true, 'Whatsapp Number is mandatory'],
				match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number']
			},
			address: {
				address1: { type: String, required: true },
				address2: String,
				area: { type: String, required: true },
				city: { type: String, required: true },
				state: { type: String, required: true },
				pincode: { type: String, required: true, match: [/^\d{6}/] }
			}
		},
		products: [productsCategorySchema],
		apartments: [apartmentManagementSchema]
	},
	{ timestamps: true }
)

export const Seller = model('seller', sellerSchema)
