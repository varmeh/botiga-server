import CreateHttpError from 'http-errors'

import { dbErrorHandler } from '../../../util'
import { Admin } from '../model/admin.model'

export const findAdminByNumber = async number => {
	try {
		const admin = await Admin.findOne({
			'contact.phone': number
		})

		if (!admin) {
			return Promise.reject(new CreateHttpError[404]('Admin not found'))
		}

		return admin
	} catch (error) {
		return dbErrorHandler(error, 'findAdminByNumber')
	}
}

export const findAdminById = async userId => {
	try {
		const admin = await Admin.findById(userId)

		if (!admin) {
			return Promise.reject(new CreateHttpError[404]('Admin not found'))
		}

		return admin
	} catch (error) {
		return dbErrorHandler(error, 'findAdminById')
	}
}
