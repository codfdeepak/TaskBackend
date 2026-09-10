# Inventory & Order API

Technical assignment implementation using Node.js, Express and MongoDB/Mongoose.

## Highlights

- JWT registration/login with bcrypt password hashing (12 rounds)
- Product CRUD, protected writes, and public product discovery
- Product search, category/availability filtering, and capped pagination
- Authenticated, user-scoped orders with immutable price/name snapshots
- Validation, consistent JSON errors, Helmet, CORS, request-size limit, and environment-based configuration
- Ready-to-import [Postman collection](postman/Inventory-Order-API.postman_collection.json)

## Requirements

- Node.js 20+
- MongoDB replica set (MongoDB Atlas works; transactions require a replica set)

## Setup

```bash
cd TaskBackend
npm install
Copy-Item .env.example .env
npm run dev
```

Set `MONGODB_URI` and a unique 32+ character `JWT_SECRET` in `.env`. For local MongoDB, start it as a single-node replica set:

```bash
mongod --replSet rs0 --dbpath ./data
mongosh --eval "rs.initiate()"
```

The API starts on `http://localhost:3000`; `GET /health` is a health check.

Run the included unit test with `npm test` and lint with `npm run lint`.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create account and receive JWT |
| POST | `/api/auth/login` | No | Login and receive JWT |
| POST | `/api/products` | Yes | Create product |
| GET | `/api/products` | No | List products |
| GET | `/api/products/:id` | No | Get product |
| PATCH | `/api/products/:id` | Yes | Update product |
| DELETE | `/api/products/:id` | Yes | Delete product |
| POST | `/api/orders` | Yes | Create order |
| GET | `/api/orders` | Yes | List current user's orders |
| GET | `/api/orders/:id` | Yes | Get one of current user's orders |

Pass the JWT as `Authorization: Bearer <token>`.

### Product listing

`GET /api/products?search=mouse&category=electronics&inStock=true&page=1&limit=10`

- `search`: case-insensitive name search
- `category`: exact normalized category
- `inStock`: `true` or `false`
- `page`: defaults to 1
- `limit`: defaults to 10 and is capped at 100

### Create an order

```json
{
  "items": [
    { "productId": "66aa00000000000000000000", "quantity": 2 }
  ]
}
```

Duplicate product IDs are combined before processing. The server calculates the price and total itself; it never trusts prices supplied by the client.

## Stock-concurrency answer

If two users attempt to buy the final unit, both requests run in a MongoDB transaction. For each line item the API executes a conditional atomic update:

```js
findOneAndUpdate(
  { _id: productId, stockQuantity: { $gte: quantity } },
  { $inc: { stockQuantity: -quantity } }
)
```

Only one request can change stock from `1` to `0`; the other finds no matching document and returns `409 Conflict`. The transaction means an order is persisted only if every stock decrement succeeds, and a failure rolls all decrements back. Thus stock cannot become negative and no unreserved order is confirmed.

For larger systems, I would also add idempotency keys to `POST /orders` and a checkout/reservation workflow with expiry.

## Postman

Import `postman/Inventory-Order-API.postman_collection.json`. Run requests in this order: Register (or Login), Create product, Create order. The collection stores the token, product ID, and order ID automatically.

## AI usage

I used OpenAI Codex to help structure the Express/Mongoose implementation, generate documentation, and review edge cases such as concurrent stock updates. I understand the submitted code and can explain or modify it.
