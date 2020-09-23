import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { User, Apartment } from '../../../models'

export const createUser = async ({
	firstName,
	lastName,
	gender,
	phone,
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
			gender,
			apartmentId,
			phone,
			signinPin: hashedPin,
			deliveryAddress: {
				house,
				aptName: name,
				area,
				city,
				state,
				pincode
			}
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
			phone: number
		})
	} catch (error) {
		winston.debug('@error findUserByNumber', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateUser = async (
	userId,
	{ firstName, lastName, gender, house, apartmentId }
) => {
	try {
		const user = await User.findById(userId)

		user.firstName = !firstName ? user.firstName : firstName
		user.lastName = !lastName ? user.lastName : lastName
		user.gender = !gender ? user.gender : gender
		user.deliveryAddress.house = !house ? user.deliveryAddress.house : house

		if (apartmentId && apartmentId !== user.apartmentId) {
			const apartment = await Apartment.findById(apartmentId)

			if (!apartment) {
				return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
			}
			user.apartmentId = apartmentId

			// Update delivery address
			const { name, area, city, state, pincode } = apartment

			const { deliveryAddress } = user
			deliveryAddress.aptName = name
			deliveryAddress.area = area
			deliveryAddress.city = city
			deliveryAddress.state = state
			deliveryAddress.pincode = pincode
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
		user.signinPin = pin
		return await user.save()
	} catch (error) {
		winston.debug('@error updateUserPin', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}
