# StockWise Backend Server

This is the backend API server for the StockWise application. It is built using Node.js, Express, TypeScript, and Prisma ORM, providing a type-safe and secure REST API for inventory management and sales records.

---

## 1. Directory Layout

The server codebase follows a layered monolithic architecture:

```text
server/
│
├── prisma/                  # Prisma configuration & migrations
├── src/
│   ├── config/              # Environment config and schema parsing (Zod)
│   ├── constants/           # Global code & message constants
│   ├── controllers/         # Request input parsing and response wrappers
│   ├── database/            # Database connection configuration
│   ├── errors/              # Custom Error definitions
│   ├── middleware/          # Security headers, CORS, rate limits, errors
│   ├── repositories/        # ORM query wrappers
│   ├── routes/              # Express endpoint router versioning
│   ├── services/            # Business workflows and operational rules
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Common logging and string utilities
│   ├── validators/          # Input schema validations (Zod)
│   ├── app.ts               # Express configuration initializer
│   └── server.ts            # Server bootstrapper & listener
│
├── tests/                   # Integration and unit tests
├── logs/                    # Local environment log files
├── eslint.config.js         # ESLint code checks
└── tsconfig.json            # TypeScript configuration compiler
```

---

## 2. Getting Started

### Prerequisites
* Node.js (LTS version recommended)
* npm (Node Package Manager)
* MySQL database instance running locally or remotely

### Installation
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## 3. Environment Configurations

1. Copy the `.env.example` file to create a local configuration file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your local variables:
   * `PORT`: Server port (default: 5000).
   * `DATABASE_URL`: Active MySQL connection string (`mysql://user:pass@host:3306/db_name`).
   * `LOG_LEVEL`: Log level constraints (`error`, `warn`, `info`, `debug`).
   * `CORS_ORIGIN`: Allowed origins.

---

## 4. Operational Scripts

Execute these scripts from within the `server/` directory:

### Development Mode
Runs the local dev server using `ts-node-dev` with hot reload enabled:
```bash
npm run dev
```

### Build Production Bundle
Compiles TypeScript files into JavaScript under the `/dist/` folder:
```bash
npm run build
```

### Start Production Build
Starts the compiled build from the output folder:
```bash
npm run start
```

### Check Lints
Runs ESLint check rules on code files:
```bash
npm run lint
```

### Format Code
Formats TypeScript files using Prettier:
```bash
npm run format
```

---

## 5. Database Integration & Prisma Workflow

StockWise integrates with MySQL using Prisma ORM.

### Database Setup
Ensure you have configured `DATABASE_URL` inside your `.env` file pointing to your active MySQL server instance.

### Run Database Migrations
To generate and apply database migrations from schema changes:
```bash
npx prisma migrate dev --name <migration_name>
```

### Generate Prisma Client
To manually regenerate the client after schema updates:
```bash
npx prisma generate
```

### Seed Database
To populate the database with realistic sample seed data:
```bash
npx prisma db seed
```

### Development Database Workflow
When updating database structures:
1. Modify models inside `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <migration_name>` to sync changes to MySQL and regenerate the client.
3. If necessary, adjust `prisma/seed.ts` and run `npx prisma db seed` to refresh local testing data.

---

## 6. REST API Reference

All API routes are mounted under `/api/v1` and follow standard JSON envelopes.

### Standard Response Layouts

#### Success Envelope (200 OK / 210 Created)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

#### Validation Mismatch (422 Unprocessable Entity)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": [
      { "field": "body.sku", "message": "SKU must be alphanumeric" }
    ]
  }
}
```

---

### API Endpoints Catalog

#### Products (`/api/v1/products`)
* `GET /`: Fetch products. Supports query filters: `?page=1&limit=20&search=Mac&categoryId=<UUID>&status=ACTIVE&sortBy=sellingPrice&sortOrder=asc`.
* `GET /:id`: Retrieve a specific product.
* `POST /`: Register a new product.
  * *Request Body*:
    ```json
    {
      "name": "Logitech Pebble M350",
      "sku": "SKU-99081",
      "categoryId": "cat-peripherals-uuid",
      "supplierId": "sup-logitech-uuid",
      "purchasePrice": 12.00,
      "sellingPrice": 29.99,
      "quantity": 50,
      "minStock": 10
    }
    ```
* `PUT /:id`: Update metadata, pricing, or inventory values.
* `DELETE /:id`: Soft delete a product. If history sales exist, switches status to `RETIRED`.

#### Categories (`/api/v1/categories`)
* `GET /`: Fetch categories list.
* `GET /:id`: Retrieve category by ID.
* `POST /`: Create category.
  * *Request Body*:
    ```json
    {
      "name": "Audio Devices",
      "description": "Headphones, micro-speakers, and bluetooth soundbars"
    }
    ```
* `PUT /:id`: Update category description or name.
* `DELETE /:id`: Soft delete category. Blocks if assigned active products exist.

#### Suppliers (`/api/v1/suppliers`)
* `GET /`: Retrieve suppliers.
* `GET /:id`: Fetch supplier by ID.
* `POST /`: Register supplier.
* `PUT /:id`: Update supplier info.
* `DELETE /:id`: Delete supplier. Blocks if products depend on it.

#### Sales (`/api/v1/sales`)
* `GET /`: List sales transactions history.
* `GET /:id`: Retrieve a single sale invoice with line items.
* `POST /`: Register checkout transaction. Automatically deducts quantities from inventory in a single MySQL transaction.
  * *Request Body*:
    ```json
    {
      "customerName": "John Doe",
      "discount": 10,
      "createdBy": "usr-sales1-uuid",
      "items": [
        { "productId": "prod-1-uuid", "quantity": 2, "unitPrice": 2499.00 }
      ]
    }
    ```
* `PUT /:id/status`: Update order fulfillment status.
* `DELETE /:id`: Cancels a processing transaction and replenishes inventory stock levels. Blocks if status is `DELIVERED`.

#### Reports (`/api/v1/reports`)
* `GET /summary`: Aggregates active products count, total purchase price stock valuation, low stock warning indicators, and out of stock counts.
* `GET /performance`: Returns the top 5 highest-selling products based on transaction quantity sums.

---

## 7. Business Logic & Calculation Specifications

StockWise isolates core operational computations and transaction sequences inside the Service layer:

### Financial & Inventory Formulae

1. **Inventory Valuation (Cost basis)**:
   $$\text{Total Stock Value} = \sum (\text{item.quantity} \times \text{product.purchase\_price})$$
2. **Inventory Valuation (Retail basis)**:
   $$\text{Total Selling Value} = \sum (\text{item.quantity} \times \text{product.selling\_price})$$
3. **Total Profit Potential**:
   $$\text{Profit Potential} = \text{Total Selling Value} - \text{Total Stock Value}$$
4. **Profit Margin Percentage**:
   $$\text{Profit Margin (\%)} = \left(\frac{\text{Total Selling Value} - \text{Total Stock Value}}{\text{Total Selling Value}}\right) \times 100$$

### Operational Workflows

#### 1. Sales Checkout Transaction Flow
1. **Validation Checks**: Verify user ID, check SKU status, and ensure that $\text{inventory.quantity} \ge \text{saleItem.quantity}$. If out of stock, reject the checkout transaction and throw `BadRequestError`.
2. **Code Generation**: A unique `TXN-XXXXX` invoice code is created dynamically and checked for database collisions.
3. **Calculations**: Subtotal is compiled. Discount percentages are computed.
4. **MySQL Transaction Block**:
   * Creates the `Sale` header row.
   * Creates all `SaleItem` rows, taking price snapshots at checkout.
   * Decrements stock counts and updates status indicators (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`).
   * Commits changes atomically. Rollbacks database changes if any item fails.

#### 2. Sales Cancellation & Replenishment
1. **Fulfillment Gate**: Check order status. If order status is `DELIVERED`, reject the deletion request to prevent invoice modifications.
2. **Replenishment Transaction**:
   * Re-calculates and increments stock levels in inventory for all lines in the cancellation invoice.
   * Re-evaluates safety status thresholds.
   * Updates `deletedAt` soft delete timestamps on the parent `Sale` record.

---

## 8. AI Placeholder Services (`aiService.ts`)

The AI module is configured with internal placeholder services under `src/services/aiService.ts` to support near-term algorithms:
* `generateReorderRecommendations()`: Returns rule-based replenishment listings based on safety stocks.
* `predictStockDemand()`: Mock forecast statistics for 30-day volumes.
* `detectSlowMovingProducts()`: Suggests markdown campaigns for aging inventory items.
* `recommendPurchaseQuantity(productId)`: Mock EOQ formula calculators.

---

## 9. Validation & Centralized Error Handling

StockWise adopts a standardized validation process and centralized exception catch flow to protect APIs and ensure consistent error response shapes.

### Input Validation & Sanitization (Zod)
All endpoints employ Zod schemas (`/validators`) executed by a generic request filter (`/middleware/validate.ts`):
1. **Request Body**: Enforces required fields, data types, length boundaries (e.g. max 50 chars for category names), positive numeric boundaries, and string trims.
2. **Parameters**: Validates ID types (e.g. UUID patterns) to block invalid variables before reaching controllers.
3. **Query Filters**: Parses paginating numbers (`page`, `limit`), enforces limits, and handles filter strings.
4. **Sanitization**: Overwrites raw Express request values (`req.body`, `req.query`, `req.params`) with Zod-parsed variables. This strips unexpected payload attributes, applies trims, and triggers default values.

### Custom Error Subclasses
All custom operational exceptions inherit from the base `CustomError` abstract class, which encapsulates the target HTTP status code and standardizes the serialization structure:
* `BadRequestError` (400): Malformed requests or dynamic parameter mismatches.
* `UnauthorizedError` (401): Missing or expired authentication credentials (future-ready).
* `ForbiddenError` (403): Access level privilege violations (future-ready).
* `NotFoundError` (404): Resource lookup failures.
* `ConflictError` (409): Unique naming duplicates or state transition violations (e.g. canceling completed sales).
* `ValidationError` (422): Input payload data validation checks failed.

### Standardized JSON Error Envelopes

#### General Error (400 / 404 / 409 / 500)
```json
{
  "success": false,
  "message": "Resource not found",
  "errors": []
}
```

#### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "sku",
      "message": "SKU must be alphanumeric"
    }
  ]
}
```

### Database Exception Mappings (Prisma Error Handlers)
The global error handler (`/middleware/errorHandler.ts`) automatically catches database constraints and maps them to appropriate HTTP codes:
* **Unique Constraint Violation (P2002)**: Converted to `ConflictError` (409) identifying duplicate attributes.
* **Foreign Key Violation (P2003)**: Converted to `BadRequestError` (400) indicating invalid parent IDs.
* **Record Not Found (P2025)**: Converted to `NotFoundError` (404) indicating the record does not exist.
* **Unexpected Failures (500)**: Unhandled runtime errors are logged via Winston to `logs/error.log` with complete stack traces, while returning a safe, generic message to the client.
