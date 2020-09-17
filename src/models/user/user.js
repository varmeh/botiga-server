import { Schema, model } from 'mongoose'

const userSchema = new Schema(
	{
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
		},
		apartmentId: {
			type: Schema.Types.ObjectId,
			ref: 'apartment',
			required: true
		},
		phone: {
			type: String,
			unique: true,
			required: [true, 'Login Number is mandatory'],
			immutable: true,
			match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
		},
		signinPin: { type: String, required: true },
		email: String,
		deliveryAddress: {
			house: { type: String, required: true },
			aptName: { type: String, required: true },
			area: { type: String, required: true },
			city: { type: String, required: true },
			state: { type: String, required: true },
			pincode: { type: String, required: true, match: [/^\d{6}/] }
		}
	},
	{ timestamps: true }
)

export const User = model('user', userSchema)
