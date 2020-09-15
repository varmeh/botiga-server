import { Schema, model } from 'mongoose'
import { apartmentSellerSchema } from './apartmentSellerSchema'

const apartmentSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true
		},
		area: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		},
		state: {
			type: String,
			required: true
		},
		location: {
			type: {
				type: String,
				enum: ['Point'],
				required: true
			},
			coordinates: {
				type: [Number],
				required: true
			}
		},
		sellers: [apartmentSellerSchema]
	},
	{ timestamps: true }
)

export const Apartment = model('apartment', apartmentSchema)
