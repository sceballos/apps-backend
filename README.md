# Apps Manager Backend


### Prerequisites

- Docker
- NodeJS

## How to run this project

1 - Clone this repository :  `git clone https://github.com/sceballos/apps-backend.git` and `cd apps-backend`.

2 - Open `Dockerfile` and modify `POSTGRES_PASSWORD` and `POSTGRES_DB` environment variables to a value you prefer.  

3 - Create a `.env` file in the root of this project with the following environment variables :

```js
SERVER_PORT = 5880
SERVER_UNEXPECTED_ERROR_MESSAGE = "The server couldn't process the request."
SERVER_INVALID_TOKEN_ERROR_MESSAGE = "No token provided or token is invalid"

DB_USER = "postgres"
DB_PASSWORD = "postgres" //change this
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "appsmanagerdb" //change this

DB_ERROR_APP_NOT_FOUND = "App not found."
DB_ERROR_USER_NOT_FOUND = "User not found."

DB_ERROR_APP_ALREADY_EXIST = "An App with the same name already exist."
DB_ERROR_USER_ALREADY_EXIST = "A User with the same username already exist."
DB_ERROR_USER_OR_PASSWORD_INCORRECT = "Username or password is incorrect."

LOGIN_USER_AND_PASSWORD_MUST_HAVE_VALUES = "You must provide username and password."
```

4 - Build Docker image (make sure you are running as root) : `docker build -t demo-psql-db ./`

5 - Run `postgresql` docker container on the same port specified in `DB_PORT` variable located at the `.env` file, in this case 5432 (make sure you are running as root): `docker run -d --name postgress-db -p 5432:5432 demo-psql-db`

5 - Run `npm install` to install all required dependencies to start the server.

6 - Run `node index.js` or `nodemon index.js` to spin up the server API.

## Running API Testing

Just run `npm test` after initializing the database and server to run all unit test cases.