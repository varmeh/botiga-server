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
