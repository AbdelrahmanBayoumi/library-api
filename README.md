# 📚 Library Management API

[![NestJS](https://img.shields.io/badge/NestJS-11.1.5-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-8.16.3-blue.svg)](https://www.postgresql.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3.25-orange.svg)](https://typeorm.io/)

A comprehensive library management API built with NestJS, featuring book borrowing, borrower management, and detailed reporting with CSV/Excel export capabilities.

- 🌍 Live Deployment: https://library-api-production-206d.up.railway.app

## 🚀 Features

- **📖 Book Management**: CRUD operations for books with search functionality
- **👥 Borrower Management**: Complete borrower lifecycle management
- **📋 Borrowing System**: Track book loans, returns, and overdue items
- **📊 Advanced Reporting**: Analytics and export capabilities (CSV/Excel)
- **🔒 Security**: Rate limiting, input validation, and security headers
- **📚 API Documentation**: Auto-generated Swagger documentation
- **🏥 Health Checks**: System monitoring and health endpoints
- **⚡ Performance**: Optimized database queries and caching

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Reliable relational database
- **ORM**: [TypeORM](https://typeorm.io/) - Database ORM with migrations
- **Documentation**: [Swagger/OpenAPI](https://swagger.io/) - API documentation
- **Export**: [ExcelJS](https://github.com/exceljs/exceljs) & [csv-writer](https://github.com/ryu1kn/csv-writer) - Data export

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/AbdelrahmanBayoumi/library-api.git
cd library-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a .env file in the root directory like [`.env.sample`](./.env.example) and fill in the required environment variables

### 4. Database Setup

```bash
# Run database migrations
npm run migration:run
```

### 5. Start the application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`, API Documentation (Swagger): `http://localhost:3000/docs`

## 🐳 Docker

If you’d rather run the API in Docker instead of installing Node & Postgres locally, you can:

1. **Build the image**

    ```bash
    docker build -t library-api .
    ```

2. **Run the container**

    ```bash
    docker run -d --name library-api --env-file .env -p 3000:3000 library-api
    ```

3. **Run migrations**

    ```bash
    docker exec library-api npm run typeorm -- --dataSource=dist/database/data-source.js migration:run
    ```

Your API will now be live at `http://localhost:3000`.
(The `--env-file .env` flag ensures your database credentials from `.env` are passed into the container.)

## 🐳 Docker Compose

If you’d like to run both PostgreSQL and the API together:

1. prepare a `.env` file with your database credentials.
2. builds the images, starts the containers in the background, and recreates them if needed
    ```bash
    docker-compose up --build -d
    ```
3. run migrations:
    ```bash
    docker-compose exec app npm run typeorm -- --dataSource=dist/database/data-source.js migration:run
    ```
4. The API is available at `http://localhost:3000`.

Manage the stack with:

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔧 Database Migrations

```bash
# Generate a new migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

## 📖 API Documentation

Refer to the API documentation for detailed information on request/response structures. ⇒ [API Documentation](./docs/API.md) or Live Swagger docs [HERE](https://library-api-production-206d.up.railway.app/docs)

### Core Endpoints

#### Books 📚

- `GET /books` - List all books with pagination and search
- `POST /books` - Create a new book
- `GET /books/:id` - Get book details
- `PUT /books/:id` - Update book information
- `DELETE /books/:id` - Delete a book

#### Borrowers 👥

- `GET /borrowers` - List all borrowers
- `POST /borrowers` - Register a new borrower
- `GET /borrowers/:id` - Get borrower details
- `PUT /borrowers/:id` - Update borrower information
- `DELETE /borrowers/:id` - Delete a borrower

#### Borrowings 📋

- `GET /borrowings` - List all borrowings
- `POST /borrowings` - Create a new borrowing
- `GET /borrowings/:id` - Get borrowing details
- `PUT /borrowings/:id/return` - Return a borrowed book
- `PUT /borrowings/:id` - Update borrowing information

#### Reports 📊

- `GET /reports/borrowings/analytics` - Get borrowing analytics
- `GET /reports/borrowings/analytics/export` - Export analytics (CSV/XLSX)
- `GET /reports/borrowings/overdue-last-month` - Export overdue report
- `GET /reports/borrowings/last-month` - Export last month's borrowings

### Health Check 🏥

- `GET /health` - System health status

## 📈 Performance & Security

- **Rate Limiting**: 30 requests per minute per IP
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Error Handling**: Global exception filter
- **Logging**: Request/response logging with correlation IDs
- **Timeout Protection**: Request timeout handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Additional Documentation

- [API Documentation](./docs/API.md) - Detailed API reference
- [Database Schema](./docs/DATABASE.md) - Database design and relationships

<h5 align="center">

⭐ **Star this repository if you find it helpful!**

</h5>

---

<h5 align="center">
 سبحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لا إِلهَ إِلأَ انْتَ أَسْتَغْفِرُكَ وَأَتْوبُ إِلَيْكَ
</h5>
