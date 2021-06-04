import { dbErrorHandler } from '../../../util'
import { Admin } from '../model/admin.model'

export const findUserByNumber = async number => {
	try {
		return await Admin.findOne({
			'contact.phone': number
		})
	} catch (error) {
		return dbErrorHandler(error, 'findUserByNumber')
	}
}
