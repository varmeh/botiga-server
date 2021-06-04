import { Schema, model } from 'mongoose'

const adminUserSchema = new Schema(
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
		contact: {
			phone: {
				type: String,
				unique: true,
				required: [true, 'Login Number is mandatory'],
				immutable: true,
				match: [/^[5-9]\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
			},
			whatsapp: {
				type: String,
				match: [/^[5-9]\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
			},
			email: String
		}
	},
	{ timestamps: true }
)

adminUserSchema.virtual('name').get(function () {
	return `${this.firstName} ${this.lastName}`
})

export const Admin = model('admin', adminUserSchema)
