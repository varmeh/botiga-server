import { Schema, model } from 'mongoose'
import { nanoid } from 'nanoid'

const addressSchema = new Schema({
	id: { type: String, default: () => nanoid(10) },
	houseNumber: { type: String, required: true },
	aptName: { type: String, required: true },
	area: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	pincode: { type: String, required: true, match: [/^\d{6}/] }
})

const userSchema = new Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		gender: { type: String, enum: ['male', 'female'], default: 'male' },
		loginNumber: {
			type: String,
			unique: true,
			required: [true, 'Login Number is mandatory'],
			immutable: true,
			match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
		},
		email: String,
		emailVerified: { type: Boolean, default: false },
		deliveryAddress: [addressSchema]
	},
	{ timestamps: true }
)

export const user = model('user', userSchema)
