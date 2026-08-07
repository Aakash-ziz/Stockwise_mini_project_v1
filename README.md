# StockWise: Full-Stack Inventory & Sales Management System

StockWise is a full-stack inventory and point-of-sale management system built with React (TypeScript + Vite), Express, and Prisma ORM connecting to a MySQL database. It supports real-time metrics tracking, catalog updates, checkout transactions, and financial analytics.

---

## 🛠 Prerequisites

Before starting, ensure you have the following installed on your machine:
* **Node.js** (LTS version recommended)
* **npm** (Node Package Manager)
* **MySQL Server** running locally or remotely

---

## 🚀 Step-by-Step Setup Guide

### 1. Database Creation
Create a new schema in your MySQL database instance:
```sql
CREATE DATABASE stockwise_db;
```

---

### 2. Backend Setup & Run

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create the backend environment configuration file:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your details:
     ```env
     PORT=5000
     NODE_ENV=development
     DATABASE_URL="mysql://<username>:<password>@localhost:3306/stockwise_db"
     LOG_LEVEL=info
     CORS_ORIGIN=*
     ```

4. Initialize the database schema and push configurations:
   ```bash
   npx prisma db push --force-reset
   ```

5. Seed the database with mock inventory catalog entries:
   ```bash
   npx prisma db seed
   ```

6. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The server will boot and run on **port 5000** (`🚀 Server running in development mode on port 5000`).*

---

### 3. Frontend Setup & Run

1. Open a new terminal window in the root directory of the project.

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create the frontend environment configuration file:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Make sure `VITE_API_BASE_URL` matches your backend address:
     ```env
     VITE_API_BASE_URL=http://localhost:5000/api/v1
     ```

4. Start the frontend client dev server:
   ```bash
   npm run dev
   ```
   *Vite will launch the frontend on **port 5173** (or fall back to **port 5174** if 5173 is already in use).*

---

### 4. Verification & Testing

* **Access the UI**: Open your web browser and navigate to the frontend URL (e.g. `http://localhost:5174/` or `http://localhost:5173/`).
* **Check Status**: 
  * The dashboard graphs and metrics should load dynamic counts from your database.
  * Navigating to the **Products** page will display catalog listings.
  * Adding items to your cart on the **Sales** page and clicking checkout should deduct quantities from your database in real time.

---

## 📁 Project Commands Summary

### Backend Commands (Inside `/server`)
* `npm run dev`: Starts the TypeScript compiler watch mode and launches the dev server.
* `npm run build`: Compiles TypeScript files into compiled JavaScript inside `/dist/`.
* `npm run lint`: Performs eslint validation checks.
* `npx prisma studio`: Launches the visual Prisma database GUI editor.

### Frontend Commands (In Root Folder)
* `npm run dev`: Starts the Vite HMR development server.
* `npm run build`: Generates the static production bundle under `/dist/`.
* `npm run lint`: Performs oxlint validation checks.
