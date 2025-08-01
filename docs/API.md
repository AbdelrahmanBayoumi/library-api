# Library Management API

## Table of Contents

- [Books](#books)
    - [Create Book](#create-book)
    - [List & Search Books](#list--search-books)
    - [Get Book by ID](#get-book-by-id)
    - [Update Book](#update-book)
    - [Delete Book](#delete-book)

- [Borrowers](#borrowers)
    - [Register Borrower](#register-borrower)
    - [List Borrowers](#list-borrowers)
    - [Get Borrower by ID](#get-borrower-by-id)
    - [Update Borrower](#update-borrower)
    - [Delete Borrower](#delete-borrower)

- [Borrowings](#borrowings)
    - [Checkout Book](#checkout-book)
    - [Return Book](#return-book)
    - [Get Loans for Borrower](#get-loans-for-borrower)
    - [List Overdue Borrowings](#list-overdue-borrowings)

- [Reports](#reports)
    - [Get Analytics](#get-analytics)
    - [Export Analytics (CSV/XLSX)](#export-analytics-csvxlsx)
    - [Export Last Month’s Overdue Borrowings](#export-last-months-overdue-borrowings)
    - [Export All Borrowings of Last Month](#export-all-borrowings-of-last-month)

- [Health Check API](#health-check-api)
- [Error Responses](#error-responses)

---

## Books

#### [Back to top 🔝](#library-management-api)

### Create Book

```

POST /books

```

**Request Body** (JSON):

```json
{
	"title": "Clean Code",
	"author": "Robert C. Martin",
	"isbn": "9780132350884",
	"availableQuantity": 5,
	"shelfLocation": "A3-12"
}
```

**Responses**

- `201 Created`

    ```json
    {
    	"id": 1,
    	"title": "Clean Code",
    	"author": "Robert C. Martin",
    	"isbn": "9780132350884",
    	"availableQuantity": 5,
    	"shelfLocation": "A3-12",
    	"borrowings": []
    }
    ```

- `400 Bad Request` on validation errors.

---

### List & Search Books

```
GET /books?title={title}&author={author}&isbn={isbn}&page={page}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}
```

**Query Parameters**

1. `title` (optional): partial title match
2. `author` (optional): partial author match
3. `isbn` (optional): exact ISBN match
4. `page` (optional): Page number (default: 1)
5. `limit` (optional): Items per page (default: 10, max: 100)
6. `sortBy` (optional): Sort field (title, author, createdAt)
7. `sortOrder` (optional): Sort order (ASC, DESC)

**Responses**

- `200 OK`

    ```json
    [
      {
    	"id": 1,
    	"title": "Clean Code",
    	"author": "Robert C. Martin",
    	"isbn": "9780132350884",
    	"availableQuantity": 5,
    	"shelfLocation": "A3-12",
    	"borrowings": []
      },
      ...
    ]
    ```

---

### Get Book by ID

```
GET /books/:id
```

**Path Parameters**

- `id` (integer, required): Book ID

**Responses**

- `200 OK` → Book object
- `404 Not Found` if no such book.

---

### Update Book

```
PUT /books/:id
```

**Path Parameters**

- `id` (integer, required): Book ID

**Request Body** (JSON, any subset of):

```json
{
	"title": "Refactoring",
	"availableQuantity": 3
}
```

**Responses**

- `200 OK` → updated Book object
- `400 Bad Request` on validation errors
- `404 Not Found` if no such book.

---

### Delete Book

```
DELETE /books/:id
```

**Path Parameters**

- `id` (integer, required): Book ID

**Responses**

- `204 No Content` on success
- `404 Not Found` if no such book.

---

## Borrowers

#### [Back to top 🔝](#library-management-api)

### Register Borrower

```
POST /borrowers
```

**Request Body** (JSON):

```json
{
	"name": "John Doe",
	"email": "john.doe@example.com",
	"registeredDate": "2025-07-31"
}
```

**Responses**

- `201 Created` → Borrower object
- `400 Bad Request` on validation errors.

---

### List Borrowers

```
GET /borrowers
```

**Responses**

- `200 OK`

    ```json
    [
      {
    	"id": 1,
    	"name": "John Doe",
    	"email": "john.doe@example.com",
    	"registeredDate": "2025-07-31",
    	"deletedAt": null,
    	"borrowings": []
      },
      ...
    ]
    ```

---

### Get Borrower by ID

```
GET /borrowers/:id
```

**Path Parameters**

- `id` (integer, required): Borrower ID

**Responses**

- `200 OK` → Borrower object
- `404 Not Found`.

---

### Update Borrower

```
PUT /borrowers/:id
```

**Path Parameters**

- `id` (integer, required): Borrower ID

**Request Body** (JSON, any subset of):

```json
{
	"email": "new.email@example.com"
}
```

**Responses**

- `200 OK` → updated Borrower
- `400 Bad Request`, `404 Not Found`.

---

### Delete Borrower

```
DELETE /borrowers/:id
```

**Path Parameters**

- `id` (integer, required): Borrower ID

**Responses**

- `204 No Content` (soft-delete)
- `404 Not Found`.

---

## Borrowings

#### [Back to top 🔝](#library-management-api)

### Checkout Book

```
POST /borrowings
```

**Request Body**:

```json
{
	"bookId": 1,
	"borrowerId": 1
}
```

**Responses**

- `201 Created` → Borrowing record
- `400 Bad Request` if book unavailable or invalid.

---

### Return Book

```
PATCH /borrowings/:id/return
```

**Path Parameters**

- `id` (integer, required): Borrowing record ID

**Request Body**:

```json
{
	"returnDate": "2025-08-10"
}
```

**Responses**

- `200 OK` → updated Borrowing
- `400 Bad Request`, `404 Not Found`.

---

### Get Loans for Borrower

```
GET /borrowings/borrower/:borrowerId
```

**Path Parameters**

- `borrowerId` (integer, required)

**Responses**

- `200 OK`

    ```json
    [
      {
    	"id": 2,
    	"borrowDate": "2025-07-30",
    	"dueDate": "2025-08-13",
    	"returnDate": null,
    	"book": { /* Book object */ },
    	"borrower": { /* Borrower object */ }
      },
      ...
    ]
    ```

---

### List Overdue Borrowings

```
GET /borrowings/overdue
```

**Responses**

- `200 OK` → array of Borrowing records where `returnDate` is null and `dueDate` has passed.

---

## Reports

#### [Back to top 🔝](#library-management-api)

### Get Analytics

```

GET /reports/borrowings/analytics?startDate={YYYY-MM-DD}\&endDate={YYYY-MM-DD}

```

**Query Parameters**

- `startDate` (string, required): Start of the date range, format `YYYY-MM-DD`
- `endDate` (string, required): End of the date range, format `YYYY-MM-DD`

**Responses**

- `200 OK`
    ```json
    {
      "totalBorrowed": 42,
      "totalReturned": 38,
      "totalOverdue": 5,
      "daily": [
    	{ "date": "2025-07-01", "count": 3 },
    	…
      ],
      "topBooks": [
    	{ "title": "Clean Code", "count": 7 },
    	…
      ],
      "topBorrowers": [
    	{ "name": "John Doe", "count": 5 },
    	…
      ]
    }
    ```

* `400 Bad Request` — missing or invalid `startDate`/`endDate`

---

### Export Analytics (CSV/XLSX)

```
GET /reports/borrowings/analytics/export?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}&format={csv|xlsx}
```

**Query Parameters**

- `startDate` (string, required): `YYYY-MM-DD`
- `endDate` (string, required): `YYYY-MM-DD`
- `format` (string, optional): `csv` (default) or `xlsx`

**Responses**

- `200 OK` — file download;
    - **Content-Disposition**: `attachment; filename="borrowing-report-{startDate}-to-{endDate}.{csv|xlsx}"`
    - **Content-Type**: `text/csv` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

---

### Export Last Month’s Overdue Borrowings

```
GET /reports/borrowings/overdue-last-month?format={csv|xlsx}
```

**Query Parameters**

- `format` (string, optional): `csv` (default) or `xlsx`

**Responses**

- `200 OK` — file download;
    - **Content-Disposition**: `attachment; filename="overdue-last-month.{csv|xlsx}"`
    - **Content-Type** as above

---

### Export All Borrowings of Last Month

```
GET /reports/borrowings/last-month?format={csv|xlsx}
```

**Query Parameters**

- `format` (string, optional): `csv` (default) or `xlsx`

**Responses**

- `200 OK` — file download;
    - **Content-Disposition**: `attachment; filename="last-month-borrowings.{csv|xlsx}"`
    - **Content-Type** as above

## Health Check API

#### [Back to top 🔝](#library-management-api)

### System Health

```http
GET /health
```

**Response:**

```json
{
	"status": "ok",
	"timestamp": "2024-01-15T12:00:00Z",
	"uptime": 3600,
	"environment": "development",
	"database": {
		"status": "up",
		"responseTime": 5
	}
}
```

## Error Responses

#### [Back to top 🔝](#library-management-api)

### Validation Error (400)

```json
{
	"statusCode": 400,
	"message": "Validation failed",
	"errors": [
		{
			"field": "email",
			"message": "email must be an email"
		}
	]
}
```

### Not Found Error (404)

```json
{
	"statusCode": 404,
	"message": "Book with id 999 not found",
	"error": "Not Found"
}
```

### Rate Limit Error (429)

```json
{
	"statusCode": 429,
	"message": "Too Many Requests",
	"error": "ThrottlerException"
}
```

### Internal Server Error (500)

```json
{
	"statusCode": 500,
	"message": "Internal server error",
	"error": "Internal Server Error"
}
```

## 📚 Additional Documentation

- [Database Schema](./DATABASE.md) - Database design and relationships
