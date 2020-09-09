import { Schema, model } from 'mongoose'

const sellerBasicInformationSchema = new Schema({
	company: { type: String, required: true },
	sellerId: { type: Schema.Types.ObjectId, ref: 'seller' },
	businessSegments: [String]
})

const apartmentSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		area: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		},
		sellers: [sellerBasicInformationSchema]
	},
	{ timestamps: true }
)

export const Apartment = model('apartment', apartmentSchema)
