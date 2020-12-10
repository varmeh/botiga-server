import AWS from 'aws-sdk'

const { AWS_ACCESS_KEY, AWS_ACCESS_SECRET, AWS_REGION } = process.env

AWS.config.update({
	accessKeyId: AWS_ACCESS_KEY,
	secretAccessKey: AWS_ACCESS_SECRET,
	region: AWS_REGION
})

export default AWS
