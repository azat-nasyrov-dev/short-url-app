# Short URL App

## Description 
Short url is a back-end application built with **Node.js**, **Nest.js**, **PostgreSQL**, and **Type ORM**.

## Technologies
- **Node.js**: Programming platform for creating server applications in JavaScript/TypeScript
- **Nest.js**: Nest is a framework for building efficient, scalable Node.js server-side applications.
- **PostgreSQL**: Relational database management system
- **TypeORM**: Object-relational mapping for modeling and interaction

## Installation

## Environment
- Run command cp .env.example .env

```bash
# development
$ npm install
```

## Running the app

```bash
# development
$ npm run dev
```

## Build and start Docker containers

```bash
# development
$ docker-compose up --build
```

## Testing Endpoints with HTTP Requests

For easier testing of API endpoints, a `requests.http` file is included in the src folder. This file is compatible with IDEs such as WebStorm or GoLand etc., which support HTTP and other request files

### How to use

1. Open the project, for example, in WebStorm or another compatible IDE.
2. Navigate to the `requests.http` file.
3. Ensure that the app is running (use `npm run dev` or `npm run start`).
4. Click on the `Send Request` button above each HTTP request in the file to test the corresponding endpoint.
