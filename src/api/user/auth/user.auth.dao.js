import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { User, Apartment } from '../../../models'

export const createUser = async ({
	firstName,
	lastName,
	phone,
	whatsapp,
	email,
	house,
	apartmentId,
	hashedPin
}) => {
	try {
		const apartment = await Apartment.findById(apartmentId)

		if (!apartment) {
			return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
		}

		const { name, area, city, state, pincode } = apartment
		const user = new User({
			firstName,
			lastName,
			phone,
			loginPin: hashedPin,
			contact: {
				phone,
				whatsapp,
				email
			}
		})

		user.contact.address.push({
			aptId: apartmentId,
			label: 'home',
			house,
			aptName: name,
			area,
			city,
			state,
			pincode
		})
		return await user.save()
	} catch (error) {
		winston.debug('@error createUser', { error, msg: error.message })
		if (error.code === 11000 && error.keyValue.phone === phone) {
			// Phone number already used.
			return Promise.reject(
				new CreateHttpError[409]('Phone number already taken')
			)
		}
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findUserByNumber = async number => {
	try {
		return await User.findOne({
			'contact.phone': number
		})
	} catch (error) {
		winston.debug('@error findUserByNumber', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateUser = async (
	userId,
	{ firstName, lastName, house, whatsapp, email, apartmentId }
) => {
	try {
		const user = await User.findById(userId)

		user.firstName = !firstName ? user.firstName : firstName
		user.lastName = !lastName ? user.lastName : lastName
		user.contact.whatsapp = !whatsapp ? user.contact.whatsapp : whatsapp
		user.contact.email = !email ? user.contact.email : email
		user.contact.address.house = !house ? user.contact.address.house : house

		if (apartmentId && apartmentId !== user.apartmentId) {
			const apartment = await Apartment.findById(apartmentId)

			if (!apartment) {
				return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
			}
			user.apartmentId = apartmentId

			// Update delivery address
			const { name, area, city, state, pincode } = apartment

			const [address] = user.contact.address
			address.aptName = name
			address.area = area
			address.city = city
			address.state = state
			address.pincode = pincode
		}

		return await user.save()
	} catch (error) {
		winston.debug('@error updateUser', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateUserPin = async (userId, pin) => {
	try {
		const user = await User.findById(userId)
		user.loginPin = pin
		return await user.save()
	} catch (error) {
		winston.debug('@error updateUserPin', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}
