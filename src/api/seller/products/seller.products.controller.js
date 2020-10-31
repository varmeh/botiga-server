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

		res.status(201).json({ id: product._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getProducts = async (req, res, next) => {
	try {
		const categories = await findProducts(token.get(req))

		const flatCategories = categories.map(category => {
			const { _id, name, products } = category

			const flatProducts = products.map(product => {
				const { _id, name, price, description, imageUrl, available } = product

				return {
					id: _id,
					name,
					price,
					available,
					description,
					imageUrl,
					size: product.sizeInfo
				}
			})
			return { categoryId: _id, name, products: flatProducts }
		})

		res.json(flatCategories)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const deleteProduct = async (req, res, next) => {
	const { categoryId, productId } = req.params
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
		quantity,
		unit,
		available,
		imageUrl,
		updateImage
	} = req.body
	try {
		const [updatedProduct, oldImageUrl] = await updateProduct({
			sellerId: token.get(req),
			categoryId,
			productId,
			name,
			description,
			price,
			quantity,
			unit,
			available,
			imageUrl,
			updateImage
		})

		if (updateImage) {
			// User have uploaded a new image
			// Delete the old image from s3 bucket
			try {
				const arr = oldImageUrl.split('/')
				const data = await aws.s3.deleteObject({
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: arr[arr.length - 1]
				})
				winston.debug('@aws delete image', { data })
			} catch (error) {
				winston.error('@error updateProduct', {
					error: error.message,
					msg: 'old image deletion failed',
					oldImageUrl
				})
			}
		}

		res.json({
			productId: updatedProduct._id,
			message: 'product updated'
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
