import { Schema, model } from 'mongoose'

const sellerBasicInformationSchema = new Schema({
	company: { type: String, required: true },
	sellerId: { type: Schema.Types.ObjectId, ref: 'seller' },
	businessSegments: [String],
	live: { type: Boolean, default: true }
})

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
		sellers: [sellerBasicInformationSchema]
	},
	{ timestamps: true }
)

export const Apartment = model('apartment', apartmentSchema)
