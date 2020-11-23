import CreateHttpError from 'http-errors'
import { winston, notifications } from '../../../util'
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

export const updateToken = async (userId, token) => {
	try {
		const user = await User.findById(userId)
		if (user.contact.pushTokens.includes(token)) {
			return 'token already exists'
		}
		user.contact.pushTokens.push(token)
		await user.save()

		notifications.apartment.subscribeUser(user.contact.address.aptId, token)

		// Register user to apartment topic for notifications
		return 'token added'
	} catch (error) {
		winston.debug('@error updateToken', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}
