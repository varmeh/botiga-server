import CreateHttpError from 'http-errors'
import { winston } from '../../util'
import { Apartment } from '../../models'

export const dbFindCities = async () => {
	try {
		const data = await Apartment.distinct('city').sort()
		return data
	} catch (error) {
		winston.debug('@error dbFindCities', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const dbFindAreasByCity = async city => {
	try {
		const data = await Apartment.distinct('area', { city }).sort()
		return data
	} catch (error) {
		winston.debug('@error dbFindAreasByCity', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const dbFindApartmentsByCityAndArea = async (city, area) => {
	try {
		const data = await Apartment.find(
			{ city, area },
			{ name: 1, state: 1, pincode: 1 }
		).sort()
		return data
	} catch (error) {
		winston.debug('@error dbFindApartmentsByCityAndArea', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const dbFindApartmentsByLocation = async (lat, long) => {
	try {
		// this query shows all apartments with-in 700 mtrs of point
		const data = await Apartment.find(
			{
				location: {
					$near: {
						$geometry: { type: 'Point', coordinates: [long, lat] },
						$maxDistance: 700
					}
				}
			},
			{ name: 1, state: 1, pincode: 1, city: 1, area: 1 }
		)
		return data
	} catch (error) {
		winston.debug('@error dbFindApartmentsByLocation', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
