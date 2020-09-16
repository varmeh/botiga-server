import CreateHttpError from 'http-errors'
import { token, aws, winston } from '../../../util'
import {
	createProduct,
	findProducts,
	updateProduct,
	removeProduct
} from './seller.products.dao'

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
