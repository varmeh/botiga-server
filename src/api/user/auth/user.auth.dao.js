import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { User, Apartment } from '../../../models'

export const createUser = async ({
	firstName,
	lastName,
	phone,
	whatsapp,
	email
}) => {
	try {
		const user = new User({
			firstName,
			lastName,
			phone,
			contact: {
				phone,
				whatsapp,
				email
			}
		})
		return await user.save()
	} catch (error) {
		winston.debug('@error createUser', { error, msg: error.message })
		if (error.code === 11000) {
			// Phone number already used.
			return Promise.reject(
				new CreateHttpError[409]('Phone number already taken')
			)
		}
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findUser = async userId => {
	try {
		return await User.findById(userId)
	} catch (error) {
		winston.debug('@error findUser', { error, msg: error.message })
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

export const updateUserProfile = async (
	userId,
	{ firstName, lastName, whatsapp, email }
) => {
	try {
		const user = await User.findById(userId)

		user.firstName = firstName
		user.lastName = lastName
		user.contact.whatsapp = whatsapp
		user.contact.email = email

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

export const updateUserAddress = async (userId, house, apartmentId) => {
	try {
		const apartment = await Apartment.findById(apartmentId)

		if (!apartment) {
			return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
		}
		const user = await User.findById(userId)

		// Update delivery address
		const { name, area, city, state, pincode } = apartment

		if (user.contact.address.length > 0) {
			// If address exists, update the address
			const [address] = user.contact.address
			address.aptName = name
			address.area = area
			address.city = city
			address.state = state
			address.pincode = pincode

			address.house = house
			address.aptId = apartmentId
		} else {
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
		}

		return await user.save()
	} catch (error) {
		winston.debug('@error updateUser', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}
