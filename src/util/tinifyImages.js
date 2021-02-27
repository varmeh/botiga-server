import tinify from 'tinify'

import aws from './aws'

tinify.key = process.env.TINY_PNG_SECRET

export const uploadTinifyImages = async ({
	image,
	fileNameToBeSavedInCloud,
	width,
	height
}) => {
	const [_, imageType] = image.mimetype.split('/')

	const source = tinify
		.fromBuffer(image.buffer)
		.preserve('copyright', 'creation')

	const buffer = await source
		.resize({ method: 'fit', width, height })
		.toBuffer()

	const downloadUrl = await aws.s3.uploadFile({
		fileName: `${fileNameToBeSavedInCloud}.${imageType}`,
		contentType: image.mimetype,
		file: buffer
	})

	return downloadUrl
}
