import CreateHttpError from 'http-errors'
import { notifications, dbErrorHandler } from '../../../util'
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
		if (error.code === 11000) {
			// Phone number already used.
			return Promise.reject(
				new CreateHttpError[409]('Phone number already taken')
			)
		}
		return dbErrorHandler(error, 'createUser')
	}
}

export const findUser = async userId => {
	try {
		return await User.findById(userId)
	} catch (error) {
		return dbErrorHandler(error, 'findUser')
	}
}

export const findUserByNumber = async number => {
	try {
		return await User.findOne({
			'contact.phone': number
		})
	} catch (error) {
		return dbErrorHandler(error, 'findUserByNumber')
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
		return dbErrorHandler(error, 'updateUser')
	}
}

export const updateToken = async (userId, token) => {
	try {
		const user = await User.findById(userId)

		// Register new token to all seller apartment topics for notifications
		user.contact.addresses.forEach(address =>
			notifications.apartment.subscribeUser(address.aptId, token)
		)

		if (user.contact.pushTokens.includes(token)) {
			return 'token already exists'
		}
		user.contact.pushTokens.push(token)
		await user.save()

		// Register user to apartment topic for notifications
		return 'token added'
	} catch (error) {
		return dbErrorHandler(error, 'updateToken')
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
		return dbErrorHandler(error, 'createUserAddress')
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
		return dbErrorHandler(error, 'updateUserAddress')
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
		return dbErrorHandler(error, 'deleteUserAddress')
	}
}
