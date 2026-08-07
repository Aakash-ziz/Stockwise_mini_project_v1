# StockWise — Backend Architecture & Planning Specification

This document defines the complete backend software architecture for the StockWise application. It outlines directory layouts, layer duties, request lifecycles, error propagation boundaries, standard API contracts, configuration schemas, and coding guidelines.

This specification serves as the definitive reference blueprint for backend developers during physical database implementation and REST API development.

---

## 1. Executive Summary

* **Purpose of the Backend**: The StockWise backend serves as the secure, authenticated REST API layer hosting the business logic, transaction boundaries, and database query abstractions of the system.
* **Project Goals**:
  * Implement safe inventory deduction and replenishment transactions.
  * Execute daily AI recommendations based on sales velocities and inventory thresholds.
  * Provide robust reporting endpoints to drive dashboards.
  * Maintain audit compliance through automatic change log tracking.
* **Database Design Philosophy**: Layered, service-oriented architecture separating request management (Express controllers) from business procedures (Services) and database queries (Repositories using Prisma ORM).
* **Scope of the MVP**: Supports 8 core models (Users, Categories, Products, Inventory, Sales, Sale Items, AI Recommendations, and Audit Logs) inside a single warehouse operational domain.
* **Intended Backend Technology Stack**: Node.js, Express.js, TypeScript, Prisma ORM, MySQL database, Zod validators.
* **Intended Scalability Goals**: Enable horizontal scaling of API nodes, efficient connection pooling, and cached aggregates to scale lookups as transactions grow.

---

## 2. Architecture Overview

StockWise adopts a **Monolithic Layered Architecture** (often referred to as an N-Tier Architecture). By separating code concerns into independent vertical layers, the system achieves loose coupling, testability, and horizontal swappability.

```text
+-----------------------------------------------------------+
|                      CLIENT CLIENT                        |
+-----------------------------------------------------------+
                              │ (HTTP Requests)
                              ▼
+-----------------------------------------------------------+
|                       ROUTE LAYER                         |
|  - Maps URLs to controllers                               |
|  - Injects Middleware (Validators, Cors)                  |
+-----------------------------------------------------------+
                              │
                              ▼
+-----------------------------------------------------------+
|                     CONTROLLER LAYER                      |
|  - Parses Request variables (params, query, body)         |
|  - Formats responses & coordinates status codes           |
+-----------------------------------------------------------+
                              │
                              ▼
+-----------------------------------------------------------+
|                      SERVICE LAYER                        |
|  - Enforces E2E business logic & rules                    |
|  - Coordinates Transaction Boundaries                     |
+-----------------------------------------------------------+
                              │
                              ▼
+-----------------------------------------------------------+
|                     REPOSITORY LAYER                      |
|  - Abstracts ORM (Prisma) queries                         |
|  - Resolves physical database connection                  |
+-----------------------------------------------------------+
                              │
                              ▼
+-----------------------------------------------------------+
|                     DATABASE LAYER                        |
|  - Physical MySQL database instance                       |
+-----------------------------------------------------------+
```

### Core Architecture Principles:
1. **Dependency Injection Flow**: Code dependencies flow downwards only. A route calls a controller, a controller calls a service, and a service calls a repository. Upper layers never reference database connections directly.
2. **Stateless Operations**: The API servers maintain no local session state. This allows horizontal load balancing of API nodes.
3. **Domain Isolation**: Product catalogs, sales registries, and audit logs are separated at the database level, ensuring changes in one domain do not cause cascading failures.

---

## 3. Technology Stack

* **Runtime Environment**: Node.js (Standardized on LTS version).
* **Programming Language**: TypeScript (to align with the React frontend codebase and guarantee compiler-level type-safety across layers).
* **API Framework**: Express.js (Layered monolith).
* **Database Engine**: MySQL.
* **Object-Relational Mapping (ORM)**: Prisma (for type-safe schema definitions and migration tracking).
* **Request Validation**: Zod (for request payload parsing and validation).
* **Database Driver**: `mysql2` client library managed by Prisma.
* **Development / Linting Tools**: ESLint, Prettier, and ts-node.

---

## 4. Backend Folder Structure

We organize the backend codebase into a structured folder hierarchy under `src/`:

```text
StockWise-Backend/
│
├── prisma/                  # Prisma schemas, seeds, and migrations
│   ├── schema.prisma        # Database models mapping blueprint
│   └── seed.ts              # Mock dataset seeds
│
├── src/
│   ├── config/              # Environment config & DB connection pools
│   │   ├── env.ts           # Zod schema validated environment
│   │   └── database.ts      # PrismaClient client singleton exports
│   │
│   ├── routes/              # Express route mappings
│   │   ├── v1/              # Versioned API routes
│   │   │   ├── products.ts
│   │   │   ├── sales.ts
│   │   │   └── index.ts     # Global router combiner
│   │
│   ├── controllers/         # HTTP request parses & response formatters
│   │   ├── productController.ts
│   │   └── salesController.ts
│   │
│   ├── services/            # Core business workflows & rules
│   │   ├── productService.ts
│   │   └── salesService.ts
│   │
│   ├── repositories/        # ORM query wrappers
│   │   ├── productRepository.ts
│   │   └── salesRepository.ts
│   │
│   ├── middleware/          # Express route filters
│   │   ├── errorHandler.ts  # Centralized error handler
│   │   ├── validate.ts      # Zod validation middleware
│   │   └── logger.ts        # Request logging middleware
│   │
│   ├── validators/          # Zod input validation schemas
│   │   ├── productValidator.ts
│   │   └── saleValidator.ts
│   │
│   ├── errors/              # Custom operational error classes
│   │   ├── customError.ts   # Base custom class
│   │   ├── badRequest.ts
│   │   ├── notFound.ts
│   │   └── businessRule.ts
│   │
│   ├── utils/               # Reusable utility functions
│   │   └── formatter.ts
│   │
│   ├── constants/           # Static values and configuration constants
│   │   └── codes.ts
│   │
│   ├── types/               # Type and Interface definitions
│   │   └── index.ts
│   │
│   └── app.ts               # Express application initializer
│
├── docs/                    # Architecture blueprints and design files
├── tests/                   # Integration and unit tests
├── logs/                    # File logging directory (production)
├── .env                     # Local environment settings file (git-ignored)
├── .env.example             # Template env file
├── package.json
└── tsconfig.json
```

---

## 5. Request Lifecycle

The lifecycle of an incoming HTTP request is illustrated below:

```
Client Request
      │
      ▼
[Express router] ➔ matches endpoint path (e.g. POST /api/v1/sales)
      │
      ▼
[validateRequest Middleware] ➔ executes Zod schema check on req.body
      │
      ├─► [FAIL] ➔ returns 422 Validation Error immediately (Formatted JSON)
      │
      ▼ [PASS]
[salesController] ➔ parses params, calls salesService.createSale()
      │
      ▼
[salesService] ➔ Enforces Business Rules (checks stock availability)
      │
      ├─► [LACK OF STOCK] ➔ Throws Custom BusinessError ➔ Catches in router wrapper
      │
      ▼ [SUCCESS]
[salesRepository] ➔ Begins atomic transaction block ➔ inserts sale & deducts stock
      │
      ▼
[Prisma / MySQL] ➔ Evaluates query constraints & commits changes
      │
      ▼
[salesService] ➔ Resolves transaction values
      │
      ▼
[salesController] ➔ Wraps values in Standard Success JSON formatter
      │
      ▼
Client Response (200 OK / 201 Created)
```

### Detailed Layer Duties during Request Flow:
1. **Router**: Matches HTTP method and URL path, then delegates to controller. Inject validators here.
2. **Validator**: Decouples type and range validation from business logic. Uses Zod schemas to reject bad payloads early.
3. **Controller**: Stateless request parser. Extracts params and queries. Calls services. Returns JSON responses.
4. **Service**: Core business logic container. Coordinates transactions. Evaluates business rules. Throws custom operational errors.
5. **Repository**: Data access layer. Wraps PrismaClient methods. Returns entity models or clean arrays.
6. **Error Handler Middleware**: Global Express catch-all. Converts custom operational errors into standard JSON responses and logs system errors.

---

## 6. Layer Responsibilities

We define what belongs in each software boundary and what must be excluded:

### 6.1 Routes
* **What belongs**: Route path mappings, HTTP verb bindings, and route-specific middleware injections (validation).
* **What must NOT belong**: Request parsing logic, business rule evaluations, or direct database queries.

### 6.2 Controllers
* **What belongs**: Reading `req.body`, `req.params`, or `req.query`, mapping payload structures to service parameters, choosing HTTP status codes, and invoking service methods.
* **What must NOT belong**: Directly importing PrismaClient, executing SQL queries, or running core business rules (like checking quantity thresholds).

### 6.3 Services
* **What belongs**: Evaluating business rules (e.g. verifying stock quantity $\ge$ sale quantity), orchestrating multi-repository database transactions, logging audits, and throwing custom error classes.
* **What must NOT belong**: Directly reading Express `req` or `res` objects, formatting HTTP responses, or managing routes.

### 6.4 Repositories
* **What belongs**: Interacting with Prisma ORM methods, formatting DB queries, and isolating database connection methods.
* **What must NOT belong**: Business validation logic or handling HTTP variables.

### 6.5 Middleware
* **What belongs**: Common route checks (CORS, validation, request logging, error catching).
* **What must NOT belong**: Business logic.

### 6.6 Validators
* **What belongs**: Static Zod type/shape schema definitions (e.g., verifying `sku` is alphanumeric).
* **What must NOT belong**: Dynamic database checks (like checking if a SKU is duplicate).

### 6.7 Configuration
* **What belongs**: Loading env files, validation of env values via Zod, and exporting database client singletons.
* **What must NOT belong**: Running application routes or initializing express nodes.

### 6.8 Error Classes
* **What belongs**: Custom subclasses extending `Error` (e.g., `NotFoundError`, `ConflictError`, `ValidationError`).
* **What must NOT belong**: Response formatting details or UI components.

---

## 7. Error Handling Strategy

Centralized error management ensures that the application catches exceptions gracefully and returns consistent responses without crashing the server.

### 7.1 Operational vs. Programmer Errors
* **Operational Errors**: Predictable runtime failures that the system must expect (e.g., product not found, invalid quantity input, duplicate SKU registration). These are handled using custom subclasses of `CustomError` and return formatted JSON responses.
* **Programmer Errors**: Unanticipated system failures caused by bugs or server issues (e.g., network failure, database client connection timeout, null pointer exceptions). These are logged with stack traces and returned to clients as general `500 Internal Server Error` messages.

### 7.2 Custom Error Classes
We define a hierarchical error system:
* **CustomError** (Abstract Base Class): Extends `Error`. Includes `statusCode` and `success` status properties.
* **ValidationError**: Thrown when Zod validators fail. Status Code: `422 Unprocessable Entity`.
* **NotFoundError**: Thrown when a resource does not exist. Status Code: `404 Not Found`.
* **ConflictError**: Thrown when unique constraints are breached (e.g., duplicate SKU). Status Code: `409 Conflict`.
* **BusinessRuleError**: Thrown when business rules are violated (e.g., out of stock checkouts). Status Code: `400 Bad Request`.
* **DatabaseError**: Thrown when a database constraint fails. Status Code: `500 Internal Server Error`.

### 7.3 Centralized Error Middleware Catch Flow
Services and controllers do not handle response formatting for errors. Instead, they catch errors using Express router wrappers and forward them (`next(error)`) to the global error middleware:

```typescript
// Conceptual global error middleware signature
// function errorHandler(error, req, res, next)
```

1. If the error inherits from `CustomError`, return its status code and formatted JSON message.
2. If it is a Prisma database error:
   * Prisma Unique Constraint error ➔ convert to `ConflictError` (`409`).
   * Prisma Record Not Found ➔ convert to `NotFoundError` (`404`).
3. Otherwise, log the stack trace to security files and return a generic `500` error to protect system details.

---

## 8. Standard API Response Format

A consistent API response structure makes API integration easier for frontend developers. All API responses conform to the following formats:

### 8.1 Successful Response (200 OK / 201 Created)
Used for data queries, edits, and creations:

```json
{
  "success": true,
  "data": {
    "id": "prod-29384",
    "name": "Sony WH-1000XM5",
    "sku": "SKU-11029",
    "quantity": 5
  },
  "message": "Resource successfully retrieved"
}
```

### 8.2 Validation Failure Response (422 Unprocessable Entity)
Returned when request parameters fail Zod validations:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Input fields failed validation checks",
    "details": [
      {
        "field": "quantity",
        "message": "Quantity must be a positive integer"
      }
    ]
  }
}
```

### 8.3 Business Rule/Operational Failure (400 Bad Request / 409 Conflict / 404 Not Found)
Returned when database or business rules reject the operation:

```json
{
  "success": false,
  "error": {
    "code": "OUT_OF_STOCK",
    "message": "Requested checkout quantity exceeds available stock levels"
  }
}
```

### 8.4 Internal Server Error (500 Internal Server Error)
Returned for unanticipated system failures:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

---

## 9. Naming Conventions

We enforce the following naming conventions to keep the codebase consistent:

* **Folders**: all lowercase, separated by dashes if composite (e.g. `src/controllers/`, `src/routes/v1/`).
* **Source Files**: camelCase, representing the module function (e.g. `productService.ts`, `salesController.ts`, `validate.ts`).
* **Controllers**: PascalCase classes ending with "Controller" or camelCase files exporting functions (e.g. `productController.ts` exporting `productController`).
* **Services**: PascalCase classes or camelCase files ending with "Service" (e.g. `productService.ts`).
* **Repositories**: camelCase modules ending with "Repository" (e.g. `productRepository.ts`).
* **Validators**: camelCase ending with "Validator" (e.g. `productValidator.ts`).
* **Constants**: `UPPER_SNAKE_CASE` (e.g. `DEFAULT_PAGE_LIMIT = 50`).
* **Environment Variables**: `UPPER_SNAKE_CASE` (e.g. `DATABASE_URL`, `PORT`).
* **Database Models**: camelCase or snake_case matching the Prisma mappings (`products`, `categories`, `audit_logs`).
* **API Endpoints**: lowercase, kebab-case, plural nouns for resources (e.g. `/api/v1/products`, `/api/v1/sale-items`).

---

## 10. API Versioning Strategy

To support future scalability and maintain compatibility, all endpoints are versioned through the URL path:

```text
/api/v1/products
/api/v1/sales
```

### Rationale:
* **Separation of Updates**: Versioning through the URL path enables making backward-incompatible changes under `/v2/` without breaking clients using the `/v1/` APIs.
* **Deprecation Strategy**: Once a `/v2/` router is deployed, the `/v1/` routes are marked as `@deprecated` in the code comments and returned with an `X-API-Deprecate-Date` HTTP header to notify clients of the sunset timeline.
* **Router Separation**: Routing files are organized into `/routes/v1/` and `/routes/v2/` folders, ensuring a clean code separation.

---

## 11. Configuration Management

StockWise manages environmental settings through dynamic variables to decouple static code logic from deployments:

* **Environment Separation**:
  * `development`: Configured with a local MySQL instance and verbose debugging.
  * `testing`: Triggered during integration testing with mock databases.
  * `production`: Enforces secure database connection over SSL and restricts verbose error details.
* **Validation**: The system uses Zod inside `src/config/env.ts` to validate environment variables at startup:

```text
DATABASE_URL: Required connection string (MySQL protocol).
PORT: Target server port (Default: 5000).
NODE_ENV: Allowed values: 'development', 'production', 'testing'.
```

If any required variable is missing or invalid, the backend prints a validation report to console and exits immediately.
* **Secrets Protection**: Secret keys and database credentials must never be committed to git repositories. They are ignored using `.gitignore` and managed using staging and production secrets managers.

---

## 12. Logging Strategy

Structured logging is essential to monitor application health and debug issues in production:

* **Log Levels**:
  * `error`: Logs system crashes, database disconnects, and uncaught programmer errors.
  * `warn`: Logs validation failures or failed business rules (operational errors).
  * `info`: Logs startup messages and external API triggers.
  * `debug`: Verbose logs for developer tracing (disabled in production).
* **Request Logging**: Every incoming request is logged by the `logger` middleware, detailing:
  * Method (GET/POST)
  * URL Path
  * Response Status Code
  * Duration in milliseconds
* **Security Filters**: The logging middleware filters out sensitive data (such as passwords, credit card numbers, or auth tokens) before writing logs.
* **Production Best Practices**: In production, logs are written to versioned files in `/logs/` and forwarded to a centralized logging pipeline (e.g., ELK stack, CloudWatch) for monitoring.

---

## 13. Coding Standards

We define coding standards to ensure code quality and readability:

* **Linting & Formatting**: Enforced via ESLint and Prettier rules matching project specifications.
* **Strict Type Safety**: `any` types are forbidden. All function arguments, variables, and return values must be explicitly typed.
* **Import Ordering**:
  1. Third-party library modules (Express, Zod, Prisma).
  2. Configuration imports.
  3. Service and Repository files.
  4. Types and interfaces.
* **Async Control**: All database or API operations must use `async/await` syntax with proper try/catch wrappers rather than raw promise nesting.
* **Single Source of Truth**: Data models, schemas, and fields must align with the approved database blueprint.

---

## 14. Scalability Considerations

To ensure the backend handles load spikes gracefully as transaction volumes grow:

* **Database Connection Pooling**: Prisma manages connection pools dynamically. Developers must configure connection pool sizes based on server instance limitations.
* **Aggregations Caching**: Metrics (like daily sales totals) must be cached in memory (e.g. using Redis) instead of querying the transaction history table for every dashboard load.
* **Database Read-Write Separation**: In the future, the backend can connect to read-replicas for query endpoints (like reporting dashboards) to offload the primary write database.

---

## 15. Future Enhancements

The following roadmap items are planned for future phases:
* **Authentication & Authorization (Phase 5)**: Integrate JWT-based authentication and role-based access control (RBAC) to restrict access to API endpoints.
* **WebSocket Integration**: Implement WebSockets to push real-time stock status changes directly to active dashboard clients.
* **Supplier API Sync**: Automate purchase order routing by linking services directly to supplier procurement endpoints.

---

## 16. Backend Readiness Checklist

Before coding begins, the following tasks must be completed:

* `[x]` Database design blueprints are finalized and approved.
* `[ ]` Local MySQL instance is configured and accessible.
* `[ ]` TypeScript compiler options are synchronized with the frontend.
* `[ ]` `.env.example` template is prepared.
* `[ ]` Logging directory `/logs/` is ignored in the git settings.
* `[ ]` Prisma CLI is installed and initialized.

---

## 17. Conclusion

This backend architecture specification provides a production-ready blueprint for the StockWise REST API. By separating concerns into distinct layers, enforcing Zod validations, standardizing error codes, and decoupling environment configurations, the architecture is prepared for physical implementation and future scaling.
