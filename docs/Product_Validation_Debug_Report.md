# StockWise API Mutation Validation Debug Report

This report documents the root cause, schema mismatches, and fixes applied to resolve the HTTP 422 (Unprocessable Entity) errors on Create, Edit, and Delete operations.

---

## 1. Root Cause

The investigation traced the HTTP 422 validation failure to a mismatch between the **seeded primary key formats** and the **backend Zod schema validation rules**:
* The database schema seeds categories, suppliers, products, and user identifiers using customized string values (e.g. `cat-electronics`, `cat-peripherals`, `sup-dell`, `prod-3`, etc.).
* However, the backend Zod validation schemas strictly enforced `.uuid('Invalid ID format')` checks on all primary key and reference ID fields.
* Consequently, any Create, Edit, or Delete request passing customized string IDs (like `cat-electronics` or `prod-3`) failed Zod verification at the validation middleware layer, rejecting the operations and returning a `422 Unprocessable Entity` status before reaching the controllers.

---

## 2. Validation Error Details

* **Error Code**: `422 Unprocessable Entity`
* **Trigger Endpoints**:
  * `POST /api/v1/products` (fails on `categoryId` and `supplierId` UUID formats)
  * `PUT /api/v1/products/:id` (fails on `id` route param UUID format)
  * `DELETE /api/v1/products/:id` (fails on `id` route param UUID format)
  * `POST /api/v1/sales` (fails on product's `productId` UUID format)
* **Error Envelope Output**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      {
        "field": "body.categoryId",
        "message": "Invalid Category ID format"
      }
    ]
  }
  ```

---

## 3. Payload Comparison Table

| Field Name | Frontend Payload Value | Backend Validator Expectation | Database Schema definition | Status |
| :--- | :--- | :--- | :--- | :--- |
| **id (Product)** | `"prod-3"` | `z.string().uuid()` ❌ | `String` (custom key) | **Resolved** |
| **categoryId** | `"cat-electronics"` | `z.string().uuid()` ❌ | `String` (custom key) | **Resolved** |
| **supplierId** | `"sup-dell"` | `z.string().uuid()` ❌ | `String` (custom key) | **Resolved** |
| **productId (Sales)** | `"prod-1"` | `z.string().uuid()` ❌ | `String` (custom key) | **Resolved** |

---

## 4. Backend Schema Comparison

To resolve the mismatch, Zod schemas were updated to accept generic non-empty strings, aligning validation expectations with the database seed inputs:

```diff
- categoryId: z.string().uuid('Invalid Category ID format')
+ categoryId: z.string().min(1, 'Category ID is required')

- supplierId: z.string().uuid('Invalid Supplier ID format').optional()
+ supplierId: z.string().min(1, 'Invalid Supplier ID format').optional()

- id: z.string().uuid('Invalid Product ID format')
+ id: z.string().min(1, 'Invalid Product ID format')
```

---

## 5. Files Modified

The following backend validator schemas were updated:
* **[productValidator.ts](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/server/src/validators/productValidator.ts)**: Removed `.uuid()` constraint checks on product `id`, `categoryId`, and `supplierId` fields.
* **[categoryValidator.ts](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/server/src/validators/categoryValidator.ts)**: Removed `.uuid()` constraint checks on category `id` fields.
* **[supplierValidator.ts](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/server/src/validators/supplierValidator.ts)**: Removed `.uuid()` constraint checks on supplier `id` fields.
* **[salesValidator.ts](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/server/src/validators/salesValidator.ts)**: Removed `.uuid()` constraint checks on line item `productId` fields.

---

## 6. Fix Applied

1. **Removed UUID Constraints**: Swapped `.uuid()` calls with `.min(1)` in all category, supplier, product, and sales Zod validation schemas.
2. **Recompiled & Restarted Server**: Rebuilt the backend code and restarted the node dev server task.

---

## 7. Verification Results

* **Add Product**: **SUCCESS**. Posting `Sony WH-1000XM5` with category name `Electronics` resolves to `cat-electronics`, validates successfully, and returns 201 Created.
* **Edit Product**: **SUCCESS**. Updating selling prices maps to PUT and succeeds.
* **Delete Product**: **SUCCESS**. Deleting products maps to DELETE and succeeds.
* **Create Sale**: **SUCCESS**. Sales cart checkout resolves SKU matching to `prod-1` and posts successfully.
* **Build Verification**:
  * Frontend compilation (`npm run build`) completed with **zero errors**.
  * Backend compilation (`npm run build`) completed with **zero errors**.
  * Both frontend and backend lint checks completed with **zero errors**.

---

## 8. Final Verdict

### Verdict: **Successfully Resolved**

### Justification:
Removing the strict UUID constraint checks aligns payload validation with the database structure. All mutations (Create, Edit, and Delete) execute successfully, and the system operates with zero compilation, lint, or runtime errors.
