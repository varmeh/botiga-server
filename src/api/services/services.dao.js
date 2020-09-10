import { InternalServerError } from 'http-errors'
import { winston } from '../../util'
import { Apartment } from '../../models'

export const dbGetCities = async () => {
	try {
		const data = await Apartment.distinct('city').sort()
		return data
	} catch (error) {
		winston.debug('@error dbGetCities', { error })
		return Promise.reject(new InternalServerError())
	}
}

export const dbGetAreasForCity = async city => {
	try {
		const data = await Apartment.distinct('area', { city }).sort()
		winston.info('message', data)
		return data
	} catch (error) {
		winston.debug('@error dbGetAreasForCity', { error })
		return Promise.reject(new InternalServerError())
	}
}
