# Petstore API

A RESTful API for a pet store application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Seed the database (optional):
   ```bash
   npx prisma db seed
   ```

5. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation
