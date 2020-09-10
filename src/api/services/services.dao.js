import { InternalServerError } from 'http-errors'
import { winston } from '../../util'
import { Apartment } from '../../models'

export const dbFindCities = async () => {
	try {
		const data = await Apartment.distinct('city').sort()
		return data
	} catch (error) {
		winston.debug('@error dbFindCities', { error })
		return Promise.reject(new InternalServerError())
	}
}

export const dbFindAreasByCity = async city => {
	try {
		const data = await Apartment.distinct('area', { city }).sort()
		return data
	} catch (error) {
		winston.debug('@error dbFindAreasByCity', { error })
		return Promise.reject(new InternalServerError())
	}
}

export const dbCreateApartment = async ({
	name,
	area,
	city,
	state,
	pincode,
	location: { lat, long }
}) => {
	try {
		const apartment = new Apartment({
			name,
			area,
			city,
			state,
			pincode,
			location: { type: 'Point', coordinates: [long, lat] }
		})
		return await apartment.save()
	} catch (error) {
		winston.debug('@error dbCreateApartment', { error })
		return Promise.reject(new InternalServerError())
	}
}
