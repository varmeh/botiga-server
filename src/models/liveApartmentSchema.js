import { Schema } from 'mongoose'

export const liveApartmentSchema = new Schema({
	apartmentId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'apartment'
	},
	apartmentName: {
		type: String,
		required: true
	},
	live: {
		type: Boolean,
		default: false
	},
	managerInfo: {
		phoneNumber: {
			type: String,
			required: true,
			match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
		},
		whatsappNumber: {
			type: String,
			required: true,
			match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number']
		}
	},
	deliverySchedule: {
		deliveryMethod: {
			type: String,
			required: true,
			enum: ['fixedDelay', 'fixedDay'],
			default: 'fixedDelay'
		},
		fixedDelayInDays: {
			type: Number,
			default: 1
		},
		fixedDay: {
			type: Number,
			min: 1, // represents a Sunday
			max: 7 // represents a Saturday
		}
	}
})
