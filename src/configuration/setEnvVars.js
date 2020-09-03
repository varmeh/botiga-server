process.env = {
	...process.env,
	PORT: 3000,
	JWT_SECRET: 'dummy-secret',
	SG_API_KEY: 'SG.dummykey',

	DB_HOST: 'dummy-host',
	DB_PORT: 25060,
	DB_SSL: true,
	DB_NAME: 'dummyDb',
	DB_USER: 'username',
	DB_PWD: 'password'
}
