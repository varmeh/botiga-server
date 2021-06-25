import { Schema } from 'mongoose'
import { moment } from '../../util'

// 'weeklySchedule' is an extension to 'day' model
// While 'day' supports only 1 day a week
// 'weeklySchedule' allows merchant to select multiple delivery days per week
export const DeliveryType = {
	day: 'day',
	duration: 'duration',
	weeklySchedule: 'weeklySchedule'
}

export const apartmentSellerSchema = new Schema({
	_id: { type: Schema.Types.ObjectId, ref: 'seller' },
	brandName: { type: String, required: true },
	tagline: String,
	brandImageUrl: String,
	homeImageUrl: String,
	homeTagline: String,
	newlyLaunched: {
		type: Boolean,
		default: false
	},
	limitedDelivery: {
		type: Boolean,
		default: false
	},
	businessCategory: { type: String, required: true },
	live: { type: Boolean, default: false },
	filters: [String],
	contact: {
		phone: {
			type: String,
			required: true
		},
		whatsapp: {
			type: String,
			required: true,
			match: [/^[5-9]\d{9}$/, 'Please provide a valid 10 digit mobile number']
		},
		email: String,
		address: String
	},
	fssaiLicenseNumber: String,
	delivery: {
		type: {
			type: String,
			required: true,
			enum: [
				DeliveryType.duration,
				DeliveryType.day,
				DeliveryType.weeklySchedule
			]
		},
		// value depends on type. for
		day: {
			type: Number,
			min: 1,
			max: 7
		},
		weeklySchedule: {
			type: [Boolean],
			required: true,
			default: [false, false, false, false, false, false, false],
			validate: v => Array.isArray(v) && v.length === 7 // Ensure length of 7
		},
		slot: String,
		minOrder: {
			type: Number,
			default: 0,
			max: 1000
		},
		fee: {
			type: Number,
			default: 0,
			max: 50
		}
	}
})

const deliveryDate = (type, day, weeklySchedule) => {
	let deliveryDate
	if (type === DeliveryType.duration) {
		deliveryDate = moment().endOf('day').add(day, 'd')
	} else if (type === DeliveryType.weeklySchedule) {
		const dayOfTheWeek = moment().day()
		let possibleDeliveryDay = dayOfTheWeek + 1

		for (let i = 0; i < 7; i++) {
			if (possibleDeliveryDay === 7) {
				possibleDeliveryDay = 0
			}

			if (weeklySchedule[possibleDeliveryDay]) {
				const deliveryDateOfThisWeek = moment()
					.day(possibleDeliveryDay)
					.endOf('day')

				deliveryDate =
					dayOfTheWeek < possibleDeliveryDay
						? deliveryDateOfThisWeek
						: deliveryDateOfThisWeek.add(1, 'weeks') // give next week delivery date
				break
			}
			possibleDeliveryDay += 1
		}
	} else {
		// In moment dates, Sunday is 0, Monday is 1 & so on
		// In Mongodb dates, Sunday is 1, Monday is 2 & so on
		// day ranges between [1, 7]. So, Sunday is 1, Monday is 2 & so on
		// Manage this distinction by using day - 1
		const dayOfTheWeek = moment().day()
		const deliveryDateOfThisWeek = moment()
			.day(day - 1)
			.endOf('day')

		deliveryDate =
			dayOfTheWeek < day - 1
				? deliveryDateOfThisWeek
				: deliveryDateOfThisWeek.add(1, 'weeks') // give next week delivery date
	}
	return deliveryDate.format('YYYY-MM-DD')
}

const getDayString = day => {
	switch (day) {
		case 0:
			return ' Sun,'

		case 1:
			return ' Mon,'

		case 2:
			return ' Tue,'

		case 3:
			return ' Wed,'

		case 4:
			return ' Thu,'

		case 5:
			return ' Fri,'

		case 6:
			return ' Sat,'

		default:
			return ''
	}
}

const deliveryMessage = (type, day, weeklySchedule) => {
	let message
	if (type === DeliveryType.duration) {
		message = `Delivers in ${day} day${day > 1 ? 's' : ''}`
	} else if (type === DeliveryType.weeklySchedule) {
		message = 'Delivers on'
		for (let i = 0; i < 7; i++) {
			if (weeklySchedule[i]) {
				message += getDayString(i)
			}
		}
		return message.slice(0, -1) // remove last ',' from string
	} else {
		;`Delivers Every ${moment()
			.day(day - 1)
			.format('dddd')}`
	}
	return type === 'duration'
		? `Delivers in ${day} day${day > 1 ? 's' : ''}`
		: `Delivers Every ${moment()
				.day(day - 1)
				.format('dddd')}`
}

apartmentSellerSchema.virtual('deliveryDate').get(function () {
	const { type, day, weeklySchedule } = this.delivery
	return deliveryDate(type, day, weeklySchedule)
})

apartmentSellerSchema.virtual('deliveryMessage').get(function () {
	const { type, day, weeklySchedule } = this.delivery
	return deliveryMessage(type, day, weeklySchedule)
})

export const apartmentVirtuals = { deliveryMessage, deliveryDate }
