import CreateHttpError from 'http-errors'
import { nanoid } from 'nanoid'

import { token, aws, winston, uploadTinifyImages } from '../../../util'
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
			mrp,
			size: { quantity, unit },
			imageUrl,
			tag,
			imageUrlLarge,
			secondaryImageUrls
		} = req.body

		const product = await createProduct(token.get(req), categoryId, {
			name,
			description,
			price,
			mrp,
			size: { quantity, unit },
			imageUrl,
			tag,
			imageUrlLarge,
			secondaryImageUrls
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
				const {
					_id,
					name,
					price,
					mrp,
					description,
					imageUrl,
					available,
					tag,
					imageUrlLarge,
					secondaryImageUrls
				} = product

				return {
					id: _id,
					name,
					price,
					mrp,
					available,
					description,
					imageUrl,
					size: product.sizeInfo,
					tag,
					imageUrlLarge,
					secondaryImageUrls
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
		mrp,
		quantity,
		unit,
		available,
		imageUrl,
		updateImage,
		tag,
		imageUrlLarge,
		secondaryImageUrls
	} = req.body
	try {
		const [updatedProduct, oldImageUrl] = await updateProduct({
			sellerId: token.get(req),
			categoryId,
			productId,
			name,
			description,
			price,
			mrp,
			quantity,
			unit,
			available,
			imageUrl,
			updateImage,
			tag,
			imageUrlLarge,
			secondaryImageUrls
		})

		if (updateImage && oldImageUrl) {
			// User have uploaded a new image
			// Delete the old image from s3 bucket
			try {
				winston.debug(`@aws s3 delete image with url: ${oldImageUrl}`)
				await aws.s3.deleteImageUrl(oldImageUrl)
			} catch (error) {
				winston.error('@error patchProduct', {
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

export const postProductImage = async (req, res, next) => {
	try {
		const image = req.file

		if (!image) {
			res.status(422).json({
				message: 'Attached file should be an image of type - png/jpg/jpeg'
			})
		}

		const fileName = `${token.get(req)}_${nanoid(6)}`

		const downloadUrl = await uploadTinifyImages({
			image,
			fileNameToBeSavedInCloud: fileName,
			width: 900,
			height: 900
		})

		if (req.body.isMainImage) {
			const coverImageUrl = await uploadTinifyImages({
				image,
				fileNameToBeSavedInCloud: `${fileName}_small`,
				width: 360,
				height: 360
			})

			res.json({ imageUrl: downloadUrl, imageUrlSmall: coverImageUrl })
		} else {
			res.json({ imageUrl: downloadUrl })
		}
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
