# Node.js + TypeScript Transaction API

A simple **Node.js + TypeScript** REST API built with **Express** that exposes a `POST /transactions` endpoint.  
This project is ideal for learning, demos, and as a starter template for production-ready APIs.

---

## Features

- 🚀 Express + TypeScript
- 📦 Clean project structure (routes, controllers, types)
- 🔐 Header logging support
- 🧪 Easy to test with Postman / cURL
- 🔄 Ready for DB, auth, and validation extensions

---

## Tech Stack

- **Node.js**
- **TypeScript**
- **Express**
- **ts-node-dev** (development)

---

## Project Structure

```text
src/
├── controllers/        # Business logic
├── routes/             # API routes
├── types/              # TypeScript interfaces
├── app.ts              # Express app setup
└── server.ts           # App entry point
```
---

## Installation

```yarn```

---

## Run in Development

```yarn dev```

Server will start at:
http://localhost:3000

---

## Build for Production

```
yarn build
yarn start
```

---

## API Reference

### Create Transaction
```
Endpoint:
POST /api/transactions

Headers (example):
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "amount": 2500,
  "currency": "INR",
  "description": "Order payment"
}

Success Response (201):
{
  "message": "Transaction created",
  "data": {
    "id": "uuid",
    "amount": 2500,
    "currency": "INR",
    "description": "Order payment",
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
}
```
---

## Header Logging

The API logs incoming request headers inside the transaction controller:
- All headers
- Authorization header
- User-Agent

---

## Scripts
```
{
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```
---

## Free Hosting Options

- Vercel (serverless setup)
- Render (recommended for Express apps)
- Railway
- Glitch (quick demos)

---

## Future Improvements

- Add request validation (Zod / Joi)
- Add database (PostgreSQL / MongoDB)
- JWT authentication & authorization
- Centralized logging (Winston / Pino)
- Swagger / OpenAPI documentation

---

## License

MIT License

---

## Author

Hardik Chaudhari
