[![pipeline status](https://gitlab.com/DTM-Henallux/MASI/etudiants/sermeus-steven/template-hono-nextjs/badges/main/pipeline.svg)](https://gitlab.com/DTM-Henallux/MASI/etudiants/sermeus-steven/template-hono-nextjs/-/commits/main)
[![coverage report](https://gitlab.com/DTM-Henallux/MASI/etudiants/sermeus-steven/template-hono-nextjs/badges/main/coverage.svg)](https://gitlab.com/DTM-Henallux/MASI/etudiants/sermeus-steven/template-hono-nextjs/-/commits/main)

# Hono NextJS Template

This is a template for a NextJS project with Hono, with basic authentication with password and JWT.

## Features

- [x] OpenAPI 3.0
  - [x] Swagger UI / Scalar UI (/api/ui | /api/scalar)
- [x] JWT Authentication
  - [x] Password
  - [x] Refresh Token
  - [x] HTTP Only Cookie
- [x] Prisma ORM
  - [x] PostgreSQL
- [x] Hono RPC Client
- [x] API Integration tests with vitest
  - [x] Uses of testcontainers for the database
  - [x] Hono test client for the API
- [x] Environment Variables validation with [t3-env](https://github.com/t3-oss/t3-env)
- [x] Gitlab CI/CD
  - [x] Lint
  - [x] Test
  - [x] Build
- [x] Versioning for API

## Getting Started

### Prerequisites

- Node.js
- Yarn
- Docker
- Docker Compose

### Installation

1. Clone the repository

```bash
git clone git@github.com/StevenSermeus/hono-next-rpc-openapi.git
```

2. Install dependencies

```bash
yarn
```

3. Start the development database

```bash
cd docker
docker-compose up -d
cd ..
```

4. Push Prisma schema to the database

```bash
yarn prisma db push
```

5. Start the development server

```bash
yarn dev
```

### File Structure

```bash
.
├── docker
├── prisma
└── src
    ├── app
    │   ├── _api
    │   ├── _components
    │   │   ├── magicui
    │   │   └── ui
    │   ├── _lib
    │   ├── _providers
    │   ├── api
    │   │   └── [[...route]]
    │   ├── fonts
    │   ├── redirect
    │   └── utils
    ├── backend
    │   ├── config
    │   ├── libs
    │   ├── middleware
    │   ├── routes
    │   │   ├── auth
    │   │   └── health
    │   └── variables
    └── tests
```

- `docker`: Docker configuration files
- `prisma`: Prisma configuration files
- `src/app`: NextJS application
  - `src/app/_api`: API routes (It imports the hono app from the backend folder)
- `src/backend`: Hono backend
  - `src/backend/routes`: API routes
- `src/tests`: Integration tests

### Run the tests

```bash
yarn test
```

### Pre-commit

You can use the pre-commit hook to run the tests before committing. This pre-commit hook is managed by husky and will run the format, lint and test scripts before committing.

```bash
yarn prepare
```

## How the authentication works

### Password

Password are hashed with argon2 before being stored in the database.

### JWT and HTTP Only Cookie

When a user logs in, 2 JWT tokens are generated:

- Access Token: This token is used to authenticate the user for the API. It is stored in the httpOnly cookie and is short-lived (15 minutes).
- Refresh Token: This token is used to generate a new Access Token. It is stored in a httpOnly cookie and is long-lived (7 days) only for the logout and renew token routes.

When the user logs out, the refresh token is invalidated.

The access token can be expired at 2 times:

- Before loading a page.
- When the user tries to access an API route.

#### Before loading a page

A middleware protects the pages that need authentication. If the access token is expired, the user is redirected to the `redirect` page with a search parameter `redirect` containing the current page. The user will call the renew endpoint to get a new access token. If the renew endpoint fails, the user is redirected to the login page. If the renew endpoint is successful, the user is redirected to the page he wanted to access.

#### When the user tries to access an API route

An automatic retry is done when the access token is expired. The user will call the renew endpoint to get a new access token. If the renew endpoint fails, the user is redirected to the login page. If the renew endpoint is successful, the user will retry the API call.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
