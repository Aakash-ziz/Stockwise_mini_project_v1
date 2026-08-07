# StockWise Backend REST API Reference Documentation

This document serves as the comprehensive technical reference for the StockWise REST API. It details endpoint paths, query structures, parameters validation rules, business logic calculations, transactional behaviors, and mock placeholders for development and client integrations.

---

## Table of Contents
1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Global API Specifications](#2-global-api-specifications)
   * [API Versioning](#api-versioning)
   * [Pagination](#pagination)
   * [Filtering & Search](#filtering--search)
   * [Sorting](#sorting)
3. [Standard Responses & Error Handling](#3-standard-responses--error-handling)
   * [Response Envelopes](#response-envelopes)
   * [HTTP Status Codes](#http-status-codes)
   * [Custom Error Classes](#custom-error-classes)
4. [General Business & Validation Rules](#4-general-business--validation-rules)
5. [API Endpoints Catalog](#5-api-endpoints-catalog)
   * [Categories API](#categories-api)
   * [Suppliers API](#suppliers-api)
   * [Products API](#products-api)
   * [Sales API](#sales-api)
   * [Reports API](#reports-api)
6. [Future Roadmaps & Enhancements](#6-future-roadmaps--enhancements)

---

## 1. Project Architecture Overview

The StockWise backend is designed using a **Monolithic Layered Architecture** to separate database persistence, logic verification, and request lifecycle management:

```text
Client Request
     │
     ▼
[Routes Layer]          ➔ Maps URLs to controllers & registers Zod schema validators
     │
     ▼
[Controllers Layer]     ➔ Parses parameters, queries, and headers from HTTP requests
     │
     ▼
[Services Layer]        ➔ Enforces core business validation rules & orchestrates transactions
     │
     ▼
[Repositories Layer]    ➔ Wraps database queries via Prisma ORM
     │
     ▼
[Database Layer]        ➔ Relational MySQL database engine
```

All communication between layers follows strict dependency injection rules: controllers never directly invoke database queries, and repositories never evaluate business constraints.

---

## 2. Global API Specifications

### API Versioning
All active routes are versioned and mounted under the `/api/v1` path prefix.
* **Current Version**: `/api/v1`
* **Deprecated Versions**: None
* **Future Upgrade Strategy**: If breaking changes are introduced, they will be mounted under `/api/v2`. The preceding `/api/v1` routes will remain active and return a custom HTTP response header `X-API-Deprecate-Date` to denote sunset windows.

### Pagination
List endpoints support paginating using query parameters:
* `page` (Type: Integer | Default: `1`): The target page index to fetch.
* `limit` (Type: Integer | Default: `20` | Max: `100`): The number of records to return in a single page.

All paginated list endpoints wrap outputs in a data envelope containing the collection array and a count of the total records matching search filters.

### Filtering & Search
List endpoints support filtering:
* `search` (Type: String | Optional): Triggers partial matching on indexes (e.g. search by name or SKU).
* `categoryId` (Type: UUID | Optional): Filters product records down to a specific category.
* `supplierId` (Type: UUID | Optional): Filters products to a target supplier.
* `status` (Type: String | Optional): Filters by model states (e.g., `ACTIVE`, `IN STOCK`, `LOW STOCK`).

### Sorting
Sorting is managed via URL parameters:
* `sortBy` (Type: String | Optional): Field key to sort results on (e.g. `name`, `sku`, `sellingPrice`, `createdAt`).
* `sortOrder` (Type: Enum | Allowed: `asc`, `desc` | Default: `desc`): The ordering direction.

---

## 3. Standard Responses & Error Handling

### Response Envelopes

#### Success Envelope (200 OK / 201 Created)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {
    "id": "e30129bc-d92e-4b6d-a10c-99d9b6fc727a",
    "name": "Peripherals"
  }
}
```

#### Standard Error Envelope (400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "message": "Resource not found.",
  "errors": []
}
```

#### Validation Error Envelope (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "sku",
      "message": "SKU must be alphanumeric"
    }
  ]
}
```

### HTTP Status Codes
The backend utilizes standard HTTP codes to denote states:
* `200 OK`: Request succeeded. Returned on GET, PUT, and DELETE cancellation.
* `201 Created`: Resource successfully written. Returned on POST endpoints.
* `204 No Content`: Empty success response (reserved for future use).
* `400 Bad Request`: Input syntax error, parameter constraint mismatch, or insufficient stock levels.
* `401 Unauthorized`: Authentication required or token signature expired (future-ready).
* `403 Forbidden`: Authenticated user lacks permission levels to perform operations (future-ready).
* `404 Not Found`: Target ID lookup returned no records in database.
* `409 Conflict`: Unique naming duplicates (SKUs, category names) or immutable state violations.
* `422 Unprocessable Entity`: Input parameters failed structural Zod validation checks.
* `500 Internal Server Error`: Unanticipated system error or database connection failure.

### Custom Error Classes
The application defines a strict hierarchy extending the Javascript `Error` class to support routing:
1. `CustomError` (Abstract Base Class): Forces implementation of `statusCode` and `serializeErrors()`.
2. `BadRequestError` (400): Handled by controllers for data check failures.
3. `UnauthorizedError` (401): Reserved for security checks.
4. `ForbiddenError` (403): Reserved for RBAC access restrictions.
5. `NotFoundError` (404): Triggered on invalid resource lookups.
6. `ConflictError` (409): Unique index breaches or transactional violations.
7. `ValidationError` (422): Instantiated on Zod schema parse failures.

---

## 4. General Business & Validation Rules

### Text Fields Sanitization
All incoming string variables are processed by the validation middleware:
* White space padding is trimmed automatically (`.trim()`).
* Empty strings (`""`) are rejected (`.min(1)`).
* Unexpected attributes in the request payload are stripped to prevent security breaches.

### Resource Validation Rules
* **SKU Rules**: Must be unique, alphanumeric, may contain dashes or underscores, and cannot be empty.
* **Category Name**: Must be unique and cannot exceed 50 characters.
* **Supplier Name**: Must be unique and cannot exceed 100 characters.
* **Cost Constraints**: `purchasePrice` and `sellingPrice` must be non-negative numbers ($\ge 0.00$).

### Core Business Rules
* **Reference Safety Rules**:
  * A Category cannot be deleted if active products are assigned to it.
  * A Supplier cannot be deleted if active products refer to it.
  * A Product cannot be deleted if historical sales records refer to it. It will be status updated to `RETIRED`.
* **Stock Security Rules**:
  * Negative inventory is forbidden. Checkout transactions are rejected if product quantity is insufficient.
  * Safety thresholds: Status is calculated as `IN STOCK` (quantity $>$ minStock), `LOW STOCK` (quantity $\le$ minStock and quantity $>0$), or `OUT OF STOCK` (quantity $= 0$).
* **Fulfillment Rules**:
  * Completed checkouts default to `DELIVERED` status and are immutable.
  * Deleting/Canceling a sale is allowed only for `PROCESSING` or `ON HOLD` sales. Doing so replenishes stock counts in MySQL.

---

## 5. API Endpoints Catalog

### Categories API

#### List Categories
* **HTTP Method & Path**: `GET /api/v1/categories`
* **Authentication**: Not Required (to be implemented in future milestone)
* **Query Parameters**:
  * `page` (Integer, Default: `1`, Optional)
  * `limit` (Integer, Default: `20`, Optional)
  * `search` (String, Optional)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Categories retrieved successfully.",
    "data": {
      "items": [
        {
          "id": "e30129bc-d92e-4b6d-a10c-99d9b6fc727a",
          "name": "Electronics",
          "description": "Consumer electronic devices",
          "createdAt": "2026-07-19T05:00:00.000Z",
          "updatedAt": "2026-07-19T05:00:00.000Z",
          "deletedAt": null
        }
      ],
      "total": 1
    }
  }
  ```

#### Get Category by ID
* **HTTP Method & Path**: `GET /api/v1/categories/:id`
* **Path Parameters**:
  * `id` (UUID, Required) - Target category ID
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category retrieved successfully.",
    "data": {
      "id": "e30129bc-d92e-4b6d-a10c-99d9b6fc727a",
      "name": "Electronics",
      "description": "Consumer electronic devices",
      "createdAt": "2026-07-19T05:00:00.000Z",
      "updatedAt": "2026-07-19T05:00:00.000Z",
      "deletedAt": null
    }
  }
  ```
* **Error Response (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Category not found",
    "errors": []
  }
  ```

#### Create Category
* **HTTP Method & Path**: `POST /api/v1/categories`
* **Request Body**:
  ```json
  {
    "name": "Peripherals",
    "description": "Keyboards and computer mouse options"
  }
  ```
* **Validation**: `name` is required (1-50 chars).
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Category created successfully.",
    "data": {
      "id": "3be2931a-f11a-4d2b-aa90-b99aa56bc229",
      "name": "Peripherals",
      "description": "Keyboards and computer mouse options",
      "createdAt": "2026-07-19T10:00:00.000Z",
      "updatedAt": "2026-07-19T10:00:00.000Z",
      "deletedAt": null
    }
  }
  ```
* **Error Response (409 Conflict)**:
  ```json
  {
    "success": false,
    "message": "Category with name \"Peripherals\" already exists",
    "errors": []
  }
  ```

#### Update Category
* **HTTP Method & Path**: `PUT /api/v1/categories/:id`
* **Path Parameters**:
  * `id` (UUID, Required)
* **Request Body**:
  ```json
  {
    "description": "Updated description for keyboards and mice"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category updated successfully.",
    "data": {
      "id": "3be2931a-f11a-4d2b-aa90-b99aa56bc229",
      "name": "Peripherals",
      "description": "Updated description for keyboards and mice",
      "createdAt": "2026-07-19T10:00:00.000Z",
      "updatedAt": "2026-07-19T10:30:00.000Z",
      "deletedAt": null
    }
  }
  ```

#### Delete Category
* **HTTP Method & Path**: `DELETE /api/v1/categories/:id`
* **Path Parameters**:
  * `id` (UUID, Required)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category deleted successfully.",
    "data": null
  }
  ```
* **Error Response (409 Conflict)**:
  ```json
  {
    "success": false,
    "message": "Cannot delete category: it has active products assigned to it",
    "errors": []
  }
  ```

---

### Suppliers API

#### List Suppliers
* **HTTP Method & Path**: `GET /api/v1/suppliers`
* **Query Parameters**:
  * `page`, `limit`, `search`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Suppliers retrieved successfully.",
    "data": {
      "items": [
        {
          "id": "f8a923bc-a982-411a-99bb-9cba62bc329a",
          "name": "Sony Logistics",
          "contactInfo": "sony-sales@sony.com",
          "createdAt": "2026-07-19T05:00:00.000Z",
          "updatedAt": "2026-07-19T05:00:00.000Z"
        }
      ],
      "total": 1
    }
  }
  ```

#### Get Supplier by ID
* **HTTP Method & Path**: `GET /api/v1/suppliers/:id`
* **Path Parameters**:
  * `id` (UUID, Required)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Supplier retrieved successfully.",
    "data": {
      "id": "f8a923bc-a982-411a-99bb-9cba62bc329a",
      "name": "Sony Logistics",
      "contactInfo": "sony-sales@sony.com",
      "createdAt": "2026-07-19T05:00:00.000Z",
      "updatedAt": "2026-07-19T05:00:00.000Z"
    }
  }
  ```

#### Create Supplier
* **HTTP Method & Path**: `POST /api/v1/suppliers`
* **Request Body**:
  ```json
  {
    "name": "Logi Distribution",
    "contactInfo": "logi-b2b@logi.com"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Supplier created successfully.",
    "data": {
      "id": "1ab2931a-e90a-42fb-aa11-199aa56cb229",
      "name": "Logi Distribution",
      "contactInfo": "logi-b2b@logi.com",
      "createdAt": "2026-07-19T10:00:00.000Z",
      "updatedAt": "2026-07-19T10:00:00.000Z"
    }
  }
  ```

#### Update Supplier
* **HTTP Method & Path**: `PUT /api/v1/suppliers/:id`
* **Path Parameters**:
  * `id` (UUID, Required)
* **Request Body**:
  ```json
  {
    "contactInfo": "updated-email@logi.com"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Supplier updated successfully.",
    "data": {
      "id": "1ab2931a-e90a-42fb-aa11-199aa56cb229",
      "name": "Logi Distribution",
      "contactInfo": "updated-email@logi.com",
      "createdAt": "2026-07-19T10:00:00.000Z",
      "updatedAt": "2026-07-19T10:45:00.000Z"
    }
  }
  ```

#### Delete Supplier
* **HTTP Method & Path**: `DELETE /api/v1/suppliers/:id`
* **Path Parameters**:
  * `id` (UUID, Required)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Supplier deleted successfully.",
    "data": null
  }
  ```
* **Error Response (409 Conflict)**:
  ```json
  {
    "success": false,
    "message": "Cannot delete supplier: it has products associated with it",
    "errors": []
  }
  ```

---

### Products API

#### List Products (Filtered & Sorted)
* **HTTP Method & Path**: `GET /api/v1/products`
* **Query Parameters**:
  * `page` (Integer, Default: `1`, Optional)
  * `limit` (Integer, Default: `20`, Optional)
  * `search` (String, SKU or Name match, Optional)
  * `categoryId` (UUID, Optional)
  * `supplierId` (UUID, Optional)
  * `status` (Enum: `ACTIVE`, `INACTIVE`, `RETIRED`, Optional)
  * `sortBy` (Enum: `name`, `sku`, `purchasePrice`, `sellingPrice`, `createdAt`, Default: `createdAt`, Optional)
  * `sortOrder` (Enum: `asc`, `desc`, Default: `desc`, Optional)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Products retrieved successfully.",
    "data": {
      "items": [
        {
          "id": "8c20bdae-289e-4a6c-9bc1-22e8964ff001",
          "name": "MacBook Pro M2",
          "sku": "SKU-29384",
          "categoryId": "e30129bc-d92e-4b6d-a10c-99d9b6fc727a",
          "supplierId": "f8a923bc-a982-411a-99bb-9cba62bc329a",
          "purchasePrice": "1850.00",
          "sellingPrice": "2499.00",
          "thumbnailColor": "#F3F4F6",
          "thumbnailIcon": "laptop",
          "status": "ACTIVE",
          "createdAt": "2026-07-19T05:00:00.000Z",
          "updatedAt": "2026-07-19T05:00:00.000Z",
          "deletedAt": null,
          "category": {
            "id": "e30129bc-d92e-4b6d-a10c-99d9b6fc727a",
            "name": "Electronics"
          },
          "supplier": {
            "id": "f8a923bc-a982-411a-99bb-9cba62bc329a",
            "name": "Sony Logistics"
          },
          "inventory": {
            "id": "993aab1e-128a-4c2b-b9ab-aa550bc99eef",
            "productId": "8c20bdae-289e-4a6c-9bc1-22e8964ff001",
            "quantity": 42,
            "minStock": 10,
            "status": "IN STOCK"
          }
        }
      ],
      "total": 1
    }
  }
  ```

#### Get Product by ID
* **HTTP Method & Path**: `GET /api/v1/products/:id`
* **Path Parameters**:
  * `id` (UUID, Required)
* **Success Response (200 OK)**:
  *(Returns a single product object with category, supplier, and inventory sub-objects as structured above).*

#### Create Product (Transactional)
* **HTTP Method & Path**: `POST /api/v1/products`
* **Request Body**:
  ```json
  {
    "name": "Sony WH-1000XM5",
    "sku": "SKU-11029",
    "categoryId": "e30129bc-d92e-4b6d-a10c-99d9b6fc727a",
    "supplierId": "f8a923bc-a982-411a-99bb-9cba62bc329a",
    "purchasePrice": 240.00,
    "sellingPrice": 349.00,
    "thumbnailColor": "#E5E7EB",
    "thumbnailIcon": "headphones",
    "status": "ACTIVE",
    "quantity": 5,
    "minStock": 10
  }
  ```
* **Transactional Behavior**: Creates the Product record and spawns the initial Inventory record inside a single MySQL transaction. If inventory creation fails, the product record is rolled back.
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Product created successfully.",
    "data": {
      "id": "773aabde-4892-4122-8bc1-ba660f9ee001",
      "name": "Sony WH-1000XM5",
      "sku": "SKU-11029",
      ...
    }
  }
  ```
* **Error Response (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Category ID e30129bc-d92e-4b6d-a10c-99d9b6fc727a not found",
    "errors": []
  }
  ```
* **Error Response (409 Conflict)**:
  ```json
  {
    "success": false,
    "message": "Product SKU \"SKU-11029\" is already assigned to a product",
    "errors": []
  }
  ```

#### Update Product
* **HTTP Method & Path**: `PUT /api/v1/products/:id`
* **Path Parameters**:
  * `id` (UUID, Required)
* **Request Body**:
  ```json
  {
    "sellingPrice": 359.00,
    "quantity": 10
  }
  ```
* **Success Response (200 OK)**:
  *(Updates prices or stock limits. Updates safety inventory status thresholds automatically).*

#### Delete Product
* **HTTP Method & Path**: `DELETE /api/v1/products/:id`
* **Path Parameters**:
  * `id` (UUID, Required)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product deleted successfully.",
    "data": null
  }
  ```
* **Error Response (409 Conflict - Retire Fallback)**:
  * *Trigger*: Product has historical sale records. It cannot be deleted. The system changes its status to `RETIRED`.
  ```json
  {
    "success": false,
    "message": "Cannot delete product due to existing historical sales transactions. Product has been status marked as \"RETIRED\".",
    "errors": []
  }
  ```

---

### Sales API

#### List Sales
* **HTTP Method & Path**: `GET /api/v1/sales`
* **Query Parameters**:
  * `page`, `limit`, `search` (Search matches customer name or transaction code).
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Sales retrieved successfully.",
    "data": {
      "items": [
        {
          "id": "TXN-90231",
          "customerName": "Alexander Thorne",
          "discount": "0.00",
          "totalPrice": "198.00",
          "status": "DELIVERED",
          "date": "2026-07-01T00:00:00.000Z",
          "createdBy": "usr-sales1",
          "createdAt": "2026-07-19T05:00:00.000Z",
          "updatedAt": "2026-07-19T05:00:00.000Z",
          "deletedAt": null,
          "saleItems": [
            {
              "id": "4b229bc1-12a9-4bba-99bb-ee990fbc982a",
              "saleId": "TXN-90231",
              "productId": "prod-3",
              "quantity": 2,
              "unitPrice": "99.00",
              "product": {
                "id": "prod-3",
                "name": "Keychron K2 V2",
                "sku": "SKU-88273"
              }
            }
          ],
          "user": {
            "id": "usr-sales1",
            "username": "sales",
            "role": "Sales"
          }
        }
      ],
      "total": 1
    }
  }
  ```

#### Get Sale by ID
* **HTTP Method & Path**: `GET /api/v1/sales/:id`
* **Path Parameters**:
  * `id` (String: `TXN-[0-9]{5}`, Required) - Transaction ID code
* **Success Response (200 OK)**:
  *(Returns a single sale invoice object with user profile and array of line items).*

#### Create Sale (Transactional Checkout)
* **HTTP Method & Path**: `POST /api/v1/sales`
* **Request Body**:
  ```json
  {
    "customerName": "Alexander Thorne",
    "discount": 10,
    "createdBy": "usr-sales1",
    "items": [
      {
        "productId": "8c20bdae-289e-4a6c-9bc1-22e8964ff001",
        "quantity": 2,
        "unitPrice": 2499.00
      }
    ]
  }
  ```
* **Transactional Behavior**: Executed inside an atomic transaction:
  1. Validates operator ID (`createdBy`) exists.
  2. Verifies each product is in catalog and has enough inventory quantity. If any item is out of stock, aborts checkout and rolls back database changes.
  3. Generates a random, unique `TXN-XXXXX` transaction number.
  4. Deducts quantity from each product's inventory and updates status thresholds (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`).
  5. Computes total price: $\text{totalPrice} = \sum (\text{qty} \times \text{unitPrice}) \times (1 - \text{discount}/100)$.
  6. Commits checkout log and registers the invoice.
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Sale transaction completed successfully.",
    "data": {
      "id": "TXN-49021",
      "customerName": "Alexander Thorne",
      "discount": "10.00",
      "totalPrice": "4498.20",
      "status": "DELIVERED",
      "date": "2026-07-19T10:45:00.000Z",
      ...
    }
  }
  ```
* **Error Response (400 Bad Request - Out of Stock)**:
  ```json
  {
    "success": false,
    "message": "Insufficient stock levels for product \"MacBook Pro M2\". Available: 1, Requested: 2",
    "errors": []
  }
  ```

#### Update Sale Status
* **HTTP Method & Path**: `PUT /api/v1/sales/:id/status`
* **Path Parameters**:
  * `id` (String: `TXN-[0-9]{5}`, Required)
* **Request Body**:
  ```json
  {
    "status": "PROCESSING"
  }
  ```
* **Success Response (200 OK)**:
  *(Updates status to `DELIVERED`, `PROCESSING`, or `ON HOLD`).*

#### Cancel/Delete Sale (Transactional Replenishment)
* **HTTP Method & Path**: `DELETE /api/v1/sales/:id`
* **Path Parameters**:
  * `id` (String: `TXN-[0-9]{5}`, Required)
* **Business Rule Gate**:
  * If sale status is `DELIVERED`, transaction cancellation is blocked (completed sales are immutable).
* **Transactional Behavior**:
  * Loops through all line items of the target invoice.
  * Increments inventory quantity counts to return stock.
  * Recomputes safety threshold states.
  * Updates `deletedAt` timestamp on the parent Sale record.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Sale transaction cancelled and inventory replenished successfully.",
    "data": null
  }
  ```
* **Error Response (409 Conflict)**:
  ```json
  {
    "success": false,
    "message": "Completed transactions (DELIVERED) are immutable and cannot be canceled",
    "errors": []
  }
  ```

---

### Reports API

#### Get Report Summary
* **HTTP Method & Path**: `GET /api/v1/reports/summary`
* **Description**: Returns centralized inventory valuation, performance counts, and financial summaries.
* **Calculations**:
  * `totalProducts`: count of active products in catalog.
  * `categoryCount` & `supplierCount`: Counts of active resources.
  * `todayRevenue` & `monthlyRevenue`: Cumulative revenue of sales created today / current calendar month.
  * `totalRevenue`: Cumulative transaction history revenue sum.
  * `totalStockValue`: Cost valuation computed as: $\sum (\text{quantity} \times \text{purchasePrice})$.
  * `totalSellingValue`: Retail valuation computed as: $\sum (\text{quantity} \times \text{sellingPrice})$.
  * `totalProfitPotential`: Projected margins computed as: $\text{Retail Value} - \text{Cost Value}$.
  * `profitMargin`: Projected average profit margins: $\left(\frac{\text{Profit}}{\text{Retail Value}}\right) \times 100$.
  * `lowStockAlerts`: Count of products requiring replenishment (quantity $\le$ minStock).
  * `outOfStockCount`: Count of items at zero stock.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Report summary calculated successfully.",
    "data": {
      "totalProducts": 5,
      "categoryCount": 2,
      "supplierCount": 5,
      "todayRevenue": 297.00,
      "monthlyRevenue": 297.00,
      "totalRevenue": 297.00,
      "totalStockValue": 99750.00,
      "totalSellingValue": 137353.00,
      "totalProfitPotential": 37603.00,
      "profitMargin": 27.38,
      "lowStockAlerts": 1,
      "outOfStockCount": 1
    }
  }
  ```

#### Get Top-Selling Products (by Volume)
* **HTTP Method & Path**: `GET /api/v1/reports/performance`
* **Query Parameters**:
  * `limit` (Integer, Default: `5`, Optional) - Limit of results
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Top performing products calculated successfully.",
    "data": [
      {
        "productId": "prod-3",
        "name": "Keychron K2 V2",
        "sku": "SKU-88273",
        "categoryName": "Peripherals",
        "unitsSold": 2
      }
    ]
  }
  ```

---

## 6. Future Roadmaps & Enhancements

The following roadmap integrations are slated for future development phases:
1. **JWT-Based Authentication**: Secure endpoints by verifying Bearer JSON Web Tokens.
2. **Role-Based Access Control (RBAC)**: Restrict write actions (POST/PUT/DELETE) to `Admin` or `Manager` roles, leaving `Sales` with read-only dashboard accesses.
3. **AI Recommendations Integration**: Replace the mock `aiService` placeholders with active ML pipelines:
   * Forecaster projections using statistical modeling.
   * EOQ replenishment suggestions synced to purchase ordering interfaces.
4. **Media uploads**: Helmet and multer middleware integration for product catalogs thumbnails.
5. **OpenAPI / Swagger documentation**: Implement automated Swagger documentation interfaces.
