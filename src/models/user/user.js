import { Schema, model } from 'mongoose'
import { notifications } from '../../util'

const addressSchema = new Schema({
	aptId: {
		type: Schema.Types.ObjectId,
		ref: 'apartment',
		required: true
	},
	label: { type: String, required: true },
	house: { type: String, required: true },
	aptName: { type: String, required: true },
	area: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	pincode: { type: String, required: true, match: [/^\d{6}/] },
	// A cart is associated to an address
	cart: {
		sellerId: {
			type: Schema.Types.ObjectId,
			ref: 'seller'
		},
		products: [
			{
				productId: { type: Schema.Types.ObjectId, required: true },
				quantity: { type: Number, min: 0.0 }
			}
		]
	}
})

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
		contact: {
			countryCode: {
				type: String,
				required: true,
				default: '91'
			},
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
			addresses: [addressSchema],
			email: String,
			pushTokens: [String]
		},
		lastUsedAddressId: {
			type: Schema.Types.ObjectId,
			ref: 'user.addresses'
		}
	},
	{ timestamps: true }
)

userSchema.virtual('name').get(function () {
	return `${this.firstName} ${this.lastName}`
})

userSchema.methods.sendNotifications = async function (title, body, orderId) {
	const tokens = this.contact.pushTokens
	for (let i = 0; i < tokens.length; i++) {
		await notifications.sendToDevice(tokens[i], title, body, orderId)
	}
}

export const User = model('user', userSchema)
