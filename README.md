# Components

- Web framework - [express](http://expressjs.com/)
- Http Logger - [morgan](https://www.npmjs.com/package/morgan)
- HTTP Request body parser - [body-parser](https://www.npmjs.com/package/body-parser)
- User Input Validation - [express-validator](https://express-validator.github.io/docs/)

## Setting Env variables

Set all env variables in `.env` file

### Copy Firebase Service Key Json file to Server

```shell
scp -i ~/.ssh/id_rsa_botiga_devdrop /Users/varunmehta/Projects/botiga/botiga-dev-firebase-adminsdk-c1asw-9878b74cbb.json safeuser@167.71.227.118:/home/safeuser/.firesdk-dev-admin.json
```

## Running the app

```bash
npm start
```

## API Documentation

- [Postman](https://documenter.getpostman.com/view/?version=latest)

## 3-Tier Testing Strategy

Testing has been divided into 3 parts:

- **Validator Tests**

  - Tests all the validators outcomes separately in `<module>.validator.test.js`

- **Controller Tests**

  - These tests are integration tests with mock data:
  - Their advantages over simple unit tests for controller are as following:
    - It validates the route existence
    - It validates the integration of express-validators with routes
    - It unit test the controllers with mock data
    - It validates the return status & messages for the outcome
    - It re-affirms the working of centralized error handler
    - While they over the overall advantage of unit tests, their time is same as integration tests

- **Dao Integration Tests**
