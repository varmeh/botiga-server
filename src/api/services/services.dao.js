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

export const dbFindApartmentsByCityAndArea = async (city, area) => {
	try {
		const data = await Apartment.find({ city, area }, { name: 1 }).sort()
		return data
	} catch (error) {
		winston.debug('@error dbFindApartmentsByCityAndArea', { error })
		return Promise.reject(new InternalServerError())
	}
}
