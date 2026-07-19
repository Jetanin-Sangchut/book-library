# Book Library

Personal book library management system with JWT authentication.

**Live:** Frontend → https://book-library-jay-jetanin.vercel.app · Backend → https://book-library-1iyq.onrender.com

---

## Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech) account (free) for the database

---

## Clone

```bash
git clone https://github.com/Jetanin-Sangchut/book-library.git
cd book-library
```

---

## Backend

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment variables

Create `backend/.env`:

```env
TURSO_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=your-secret-key
PORT=3001
```

> Get `TURSO_URL` and `TURSO_AUTH_TOKEN` from the [Turso dashboard](https://app.turso.tech) after creating a database.

### 3. Seed the database

```bash
npm run seed
```

This creates the `users` and `books` tables and pre-seeds 2 users + 5 sample books.

### 4. Run

```bash
npm run dev
```

Server starts at `http://localhost:3001`

**Health check:** `GET http://localhost:3001/` → `{ "status": "ok" }`

---

## Frontend

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Environment variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> For production, set `NEXT_PUBLIC_API_URL=https://book-library-1iyq.onrender.com`

### 3. Run

```bash
npm run dev
```

App starts at `http://localhost:3000`

---

## Test Credentials

| Username | Password    |
|----------|-------------|
| alice    | password123 |
| bob      | password456 |

---

## API Endpoints

| Method   | Endpoint             | Auth     | Description          |
|----------|----------------------|----------|----------------------|
| `POST`   | `/api/auth/login`    | —        | Login, returns JWT   |
| `GET`    | `/api/books`         | —        | List all books       |
| `POST`   | `/api/books`         | Bearer   | Add a book           |
| `DELETE` | `/api/books/:id`     | Bearer   | Delete a book        |

See `api-collection/` for Bruno request files.

---

## Project Structure

```
book-library/
├── backend/
│   └── src/
│       ├── index.ts              # Express server
│       ├── db.ts                 # Turso client
│       ├── repositories/
│       │   └── BookRepository.ts
│       ├── services/
│       │   ├── AuthService.ts
│       │   └── BookService.ts
│       ├── middleware/
│       │   └── auth.ts
│       ├── controllers/
│       │   ├── AuthController.ts
│       │   └── BookController.ts
│       └── routes/
│           ├── auth.ts
│           └── books.ts
└── frontend/
    ├── app/
    │   ├── page.tsx              # Landing (SSR)
    │   ├── login/page.tsx        # Login
    │   └── books/page.tsx        # Dashboard
    ├── components/
    │   ├── BookForm.tsx
    │   └── BookList.tsx
    ├── lib/api.ts                # Fetch wrapper
    └── types/index.ts
```
