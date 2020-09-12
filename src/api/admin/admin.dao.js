import CreateHttpError from 'http-errors'
import { winston } from '../../util'
import { Apartment } from '../../models'

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
		return Promise.reject(new CreateHttpError[500]())
	}
}
