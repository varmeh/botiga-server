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

export const updateToken = async (userId, token) => {
	try {
		const user = await User.findById(userId)
		if (user.contact.pushTokens.includes(token)) {
			return 'token already exists'
		}
		user.contact.pushTokens.push(token)
		await user.save()

		// Register new token to all seller apartment topics for notifications
		user.contact.addresses.forEach(address =>
			notifications.apartment.subscribeUser(address.aptId, token)
		)

		// Register user to apartment topic for notifications
		return 'token added'
	} catch (error) {
		winston.debug('@error updateToken', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const createAddress = async (userId, house, apartmentId) => {
	try {
		const apartment = await Apartment.findById(apartmentId)

		if (!apartment) {
			return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
		}
		const user = await User.findById(userId)

		// Add delivery address
		const { name, area, city, state, pincode } = apartment

		user.contact.addresses.push({
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
		winston.debug('@error createUserAddress', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateAddress = async (userId, house, id) => {
	try {
		const user = await User.findById(userId)

		const address = user.contact.addresses.id(id)

		if (!address) {
			return Promise.reject(new CreateHttpError[404]('Address Not Found'))
		}

		address.house = house

		return await user.save()
	} catch (error) {
		winston.debug('@error updateUserAddress', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const deleteAddress = async (userId, id) => {
	try {
		const user = await User.findById(userId)

		if (user.contact.addresses.length === 1) {
			return Promise.reject(
				new CreateHttpError[401]('Unauthorized - Atleast one address required')
			)
		}
		user.contact.addresses.id(id).remove()

		return await user.save()
	} catch (error) {
		winston.debug('@error deleteUserAddress', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}
