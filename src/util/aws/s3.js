import CreateHttpError from 'http-errors'

import { winston } from '../winston.logger'

import aws from './aws.config'

const awsS3 = new aws.S3({ apiVersion: '2006-03-01' })

const getPredefinedUrl = async (fileName, contentType) => {
	const { AWS_BUCKET_NAME, AWS_REGION } = process.env
	try {
		const data = await awsS3.getSignedUrlPromise('putObject', {
			Bucket: AWS_BUCKET_NAME,
			Key: fileName,
			Expires: 10 * 60,
			ContentType: contentType,
			ACL: 'public-read'
		})

		return {
			uploadUrl: data,
			downloadUrl: `https://s3.${AWS_REGION}.amazonaws.com/${AWS_BUCKET_NAME}/${fileName}`
		}
	} catch (error) {
		winston.debug('@error awsPredefinedImageUrl', {
			error,
			msg: error.message
		})
		return Promise.reject(
			new CreateHttpError[500]('Unable to generate image url')
		)
	}
}

// Filename should include file extension
export default {
	getPredefinedImageUrl: (fileName, imageType) =>
		getPredefinedUrl(fileName, `image/${imageType}`),
	deleteImageUrl: async imageUrl => {
		try {
			const arr = imageUrl.split('/')

			console.debug(imageUrl, arr)
			return await awsS3
				.deleteObject({
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: arr[arr.length - 1]
				})
				.promise()
		} catch (error) {
			winston.debug('@error deleteImageUrl', {
				error,
				msg: error.message
			})
			return Promise.reject(
				new CreateHttpError[500]('Unable to generate image url')
			)
		}
	}
}
