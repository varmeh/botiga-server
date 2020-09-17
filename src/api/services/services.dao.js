import CreateHttpError from 'http-errors'
import { winston } from '../../util'
import { Apartment } from '../../models'

export const findCities = async () => {
	try {
		const data = await Apartment.distinct('city').sort()
		return data
	} catch (error) {
		winston.debug('@error findCities', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findAreaByCity = async city => {
	try {
		const data = await Apartment.distinct('area', { city }).sort()
		return data
	} catch (error) {
		winston.debug('@error findAreaByCity', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findApartmentsByCityAndArea = async (city, area) => {
	try {
		const data = await Apartment.find(
			{ city, area },
			{ name: 1, state: 1, pincode: 1 }
		).sort()
		return data
	} catch (error) {
		winston.debug('@error findApartmentsByCityAndArea', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findApartmentsByLocation = async (lat, long) => {
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
		winston.debug('@error findApartmentsByLocation', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
