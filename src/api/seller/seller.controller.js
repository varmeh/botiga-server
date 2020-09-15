import CreateHttpError from 'http-errors'
import nanoid from 'nanoid'
import { token, aws, winston } from '../../util'
import {
	createCategory,
	removeCategory,
	updateCategory,
	createProduct,
	findProducts,
	updateProduct,
	removeProduct,
	findApartments,
	addApartment
} from './seller.dao'

export const getImageUrl = async (req, res, next) => {
	const { imageType } = req.params
	const fileName = `${token.get(req)}_${nanoid(6)}.${imageType}`
	const bucket = process.env.AWS_BUCKET_NAME
	try {
		const data = await aws.s3
			.getSignedUrl('putObject', {
				Bucket: bucket,
				Key: fileName,
				Expires: 10 * 60,
				ContentType: `image/${imageType}`,
				ACL: 'public-read'
			})
			.promise()

		res.status(201).json({
			uploadUrl: data,
			downloadUrl: `https://${bucket}.s3.amazonaws.com/${fileName}`
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

/****************************************************************
 *	Category Controllers
 ****************************************************************/
export const postCategory = async (req, res, next) => {
	try {
		const { categories } = await createCategory(token.get(req), req.body.name)

		res.status(201).json({ category: categories[categories.length - 1] })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getCategories = async (req, res, next) => {
	try {
		const categories = await findProducts(token.get(req))

		res.json(categories.map(({ _id, name }) => ({ id: _id, name })))
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const deleteCategory = async (req, res, next) => {
	try {
		await removeCategory(token.get(req), req.body.categoryId)

		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchCategory = async (req, res, next) => {
	const { name, categoryId } = req.body
	try {
		const category = await updateCategory(token.get(req), name, categoryId)

		res.json({ id: category._id, newCategoryName: category.name })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

/****************************************************************
 *	Product Controllers
 ****************************************************************/

export const postProduct = async (req, res, next) => {
	try {
		const {
			categoryId,
			name,
			description,
			price,
			size: { quantity, unit },
			imageUrl
		} = req.body

		const product = await createProduct(token.get(req), categoryId, {
			name,
			description,
			price,
			size: { quantity, unit },
			imageUrl
		})

		res.status(201).json(product)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getProducts = async (req, res, next) => {
	try {
		const productsCategories = await findProducts(token.get(req))

		res.json(productsCategories)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const deleteProduct = async (req, res, next) => {
	const { categoryId, productId } = req.body
	try {
		await removeProduct(token.get(req), categoryId, productId)

		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchProduct = async (req, res, next) => {
	const {
		categoryId,
		productId,
		name,
		description,
		price,
		size,
		imageUrl
	} = req.body
	try {
		const [updatedProduct, oldImageUrl] = await updateProduct({
			sellerId: token.get(req),
			categoryId,
			productId,
			name,
			description,
			price,
			size,
			imageUrl
		})

		if (updatedProduct.imageUrl !== oldImageUrl) {
			// User have uploaded a new image
			// Delete the old image from s3 bucket
			const arr = oldImageUrl.split('/')
			const data = await aws.s3.deleteObject({
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: arr[arr.length - 1]
			})
			winston.debug('@aws delete image', { data })
		}

		res.json(updatedProduct)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

/****************************************************************
 *	Product Controllers
 ****************************************************************/

export const getApartments = async (req, res, next) => {
	try {
		const apartments = await findApartments(token.get(req))

		res.json(apartments)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postApartments = async (req, res, next) => {
	const { apartmentId } = req.body
	try {
		const apartment = await addApartment(token.get(req), apartmentId)
		res.json(apartment)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
