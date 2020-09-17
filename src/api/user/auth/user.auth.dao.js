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
		winston.debug('@error createUser', { error })
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
		winston.debug('@error findUserByNumber', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
