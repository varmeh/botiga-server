/* Remember order matters when registering routes */
export default app => {
	const baseUrl = '/api/user'
	app.get(baseUrl, (_, res) => res.json({ hello: 'botiga' }))
}
