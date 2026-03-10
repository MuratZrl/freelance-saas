# Freelance SaaS — Invoice & Client Manager

A production-ready REST API for freelancers to manage clients and invoices.

## Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL (Docker)
- **ORM:** TypeORM
- **Auth:** JWT + Passport
- **Docs:** Swagger UI

## Features

- JWT authentication (register/login)
- Client management (CRUD)
- Invoice management with line items, tax and discount calculation
- Dashboard stats (total revenue, paid, pending, overdue)
- Auto-generated invoice numbers
- Input validation with class-validator
- Swagger API docs at `/api`

## Running Locally
```bash
docker-compose up -d
npm install
npm run start:dev
```

## Environment Variables
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=freelance_saas
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
```

## API Docs

Visit `http://localhost:3000/api` for interactive Swagger docs.