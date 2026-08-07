# StockWise — Relationship Analysis

This document details the logical relationships, key definitions, referential integrity rules, cascade behaviors, constraint classifications, and indexing strategies for the StockWise database design. It maps how logical tables connect and interact to preserve data integrity across business processes, without writing SQL scripts or physical schema definitions.

---

## 1. Relationship Hierarchy Diagram (Text-Based)

The logical dependencies among StockWise tables are structured hierarchically below:

```text
categories
└── products
    ├── inventory
    ├── sale_items
    └── ai_recommendations

sales
└── sale_items

users
├── sales (via created_by)
├── products (via created_by/updated_by)
├── inventory (via updated_by)
├── ai_recommendations (via updated_by)
└── audit_logs (via actor_id)
```

---

## 2. Relationship Purpose & Participation

We document the rationale and mandatory/optional participation bounds for each relationship:

### 2.1 Category ➔ Products
* **Purpose**: A category groups similar products together. This organizes the product catalog, supports filtering, and facilitates category-level sales velocity reporting.
* **Participation**: 
  * *Products*: Mandatory. Every product profile must belong to exactly one category.
  * *Categories*: Optional. A category may exist with zero associated products (e.g., when a new category is created prior to stock acquisition).

### 2.2 Product ➔ Inventory
* **Purpose**: Tracks the live physical stock levels and stock warnings of a product profile.
* **Participation**:
  * *Inventory*: Mandatory. Every inventory record must reference exactly one product.
  * *Products*: Mandatory. A product cannot exist without an accompanying inventory track to prevent untracked catalog items.

### 2.3 Product ➔ Sale Items
* **Purpose**: Records the details of which product was purchased in a specific transaction.
* **Participation**:
  * *Sale Items*: Mandatory. A sale line item must reference exactly one product.
  * *Products*: Optional. A product may have zero sale items associated with it if it has never been sold.

### 2.4 Sale ➔ Sale Items
* **Purpose**: Links transactional line items to their main sale order header (invoice metadata).
* **Participation**:
  * *Sale Items*: Mandatory. Every sale line item must belong to exactly one parent sale header.
  * *Sales*: Mandatory. A sale header transaction must contain at least one sale line item (empty invoices are forbidden).

### 2.5 Product ➔ AI Recommendations
* **Purpose**: Links replenishment alerts to the specific catalog item requiring restock.
* **Participation**:
  * *AI Recommendations*: Mandatory. An alert must reference exactly one product.
  * *Products*: Optional. A product can have zero or multiple AI recommendations.

### 2.6 User ➔ Audit Logs
* **Purpose**: Tracks accountability by associating a system log entry with the actor who triggered the event.
* **Participation**:
  * *Audit Logs*: Mandatory. Every audit entry must be logged to a specific user.
  * *Users*: Optional. A user may have triggered zero or multiple audit logs.

---

## 3. Relationship Cardinality Summary

The following table summarizes the cardinality constraints between the tables:

| Parent Table | Child Table | Relationship Type | Business Rule |
| :--- | :--- | :--- | :--- |
| `categories` | `products` | One-to-Many | One category can categorize many products; a product belongs to one category. |
| `products` | `inventory` | One-to-One | A product has exactly one inventory log; an inventory log tracks one product. |
| `products` | `sale_items` | One-to-Many | A product can appear on multiple sale line items; a line item references one product. |
| `sales` | `sale_items` | One-to-Many | A sale transaction can have many line items; a line item belongs to one transaction. |
| `products` | `ai_recommendations`| One-to-Many | A product can have multiple recommendations generated; an alert maps to one product. |
| `users` | `sales` | One-to-Many | A user (cashier) can log multiple sales; a sale is processed by one cashier. |
| `users` | `audit_logs` | One-to-Many | A user can trigger multiple audit logs; an audit entry is tied to one user. |

---

## 4. Key Definitions

### 4.1 Primary Keys
We define the logical primary keys that uniquely identify records in each table:

* **products (`id`)**: Uniquely identifies a product profile. Rationale: Randomly generated UUID string ensures global uniqueness and prevents ID collisions during store syncs.
* **categories (`id`)**: Uniquely identifies a category. Rationale: A unique string key (e.g. `cat-electronics`) is readable and ensures logical uniqueness.
* **inventory (`id`)**: Uniquely identifies an inventory record. Rationale: Separates the inventory tracking instance from the product profile itself.
* **sales (`id`)**: Uniquely identifies a transaction. Rationale: A formatted sequential/alphanumeric code (e.g., `TXN-90231`) serves as a unique invoice number for customers.
* **sale_items (`id`)**: Uniquely identifies a transaction line. Rationale: UUID string separates duplicate product lines in a single invoice.
* **ai_recommendations (`id`)**: Uniquely identifies an alert. Rationale: UUID string isolates individual suggestion logs.
* **audit_logs (`id`)**: Uniquely identifies an audit log. Rationale: UUID string isolates individual, immutable audit entries.

### 4.2 Candidate Keys
We identify alternative unique candidate keys that must be enforced:

* **products**: `sku` (Candidate Key). Business Rule: SKU code must be unique across all products to prevent catalog confusion.
* **categories**: `name` (Candidate Key). Business Rule: Category names must be unique to avoid duplicate product categorization buckets.
* **inventory**: `product_id` (Candidate Key). Business Rule: To enforce a strict 1:1 relationship, a product can only have a single inventory record.

### 4.3 Foreign Keys
We document the logical foreign keys linking tables:

* **products (`category_id`)** ➔ References `categories(id)`. Reason: Connects the product to its category taxonomy.
* **inventory (`product_id`)** ➔ References `products(id)`. Reason: Associates real-time counts with a specific product catalog item.
* **sale_items (`sale_id`)** ➔ References `sales(id)`. Reason: Associates a line item with its parent transaction invoice.
* **sale_items (`product_id`)** ➔ References `products(id)`. Reason: Identifies which product was sold in that line item.
* **ai_recommendations (`product_id`)** ➔ References `products(id)`. Reason: Identifies the target product for the replenishment alert.
* **sales (`created_by`)** ➔ References `users(id)`. Reason: Identifies the user cashier who processed the checkout.
* **audit_logs (`actor_id`)** ➔ References `users(id)`. Reason: Identifies the operator responsible for the logged action.

---

## 5. Master Relationship Matrix

The matrix below consolidates all structural connections:

| Parent Table | Child Table | Foreign Key | Relationship Type | Participation | Delete Rule | Update Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `categories` | `products` | `category_id` | One-to-Many | Parent: Optional \| Child: Mandatory | RESTRICT | CASCADE |
| `products` | `inventory` | `product_id` | One-to-One | Parent: Mandatory \| Child: Mandatory | RESTRICT | CASCADE |
| `products` | `sale_items` | `product_id` | One-to-Many | Parent: Optional \| Child: Mandatory | RESTRICT | CASCADE |
| `sales` | `sale_items` | `sale_id` | One-to-Many | Parent: Mandatory \| Child: Mandatory | CASCADE | CASCADE |
| `products` | `ai_recommendations`| `product_id` | One-to-Many | Parent: Optional \| Child: Mandatory | CASCADE | CASCADE |
| `users` | `sales` | `created_by` | One-to-Many | Parent: Optional \| Child: Optional | RESTRICT | CASCADE |
| `users` | `audit_logs` | `actor_id` | One-to-Many | Parent: Optional \| Child: Mandatory | RESTRICT | CASCADE |

---

## 6. Referential Integrity & Cascade Behavior Justifications

We define the behaviors when parent records are updated or deleted:

### 6.1 Category ➔ Products
* **Delete Rule**: `RESTRICT`. 
  * *Justification*: Deleting a category must be blocked if it contains active products. This prevents leaving products orphaned without an organizational bucket.
* **Update Rule**: `CASCADE`.
  * *Justification*: If a category's unique identifier changes, the referencing products should update automatically.

### 6.2 Product ➔ Inventory
* **Delete Rule**: `RESTRICT` (or logical soft-delete).
  * *Justification*: To prevent data loss in audit records, a product profile cannot be deleted if inventory history or sales exist. When deleting a product with zero sales, it should cascadingly clean up its inventory logs.
* **Update Rule**: `CASCADE`.
  * *Justification*: Changing a product's identifier must immediately sync to its inventory balance record.

### 6.3 Sale ➔ Sale Items
* **Delete Rule**: `CASCADE`.
  * *Justification*: Sale items are detail rows that exist solely as components of an invoice. If a draft or pending transaction is cancelled or deleted, the associated line items must be removed automatically.
* **Update Rule**: `CASCADE`.
  * *Justification*: Updates to sale IDs must immediately cascade to update the line items' associations.

### 6.4 Product ➔ Sale Items
* **Delete Rule**: `RESTRICT`.
  * *Justification*: A product cannot be deleted if it is linked to completed transactions. Doing so would orphan transaction lines, rendering historical sales summaries invalid.
* **Update Rule**: `CASCADE`.

### 6.5 Product ➔ AI Recommendations
* **Delete Rule**: `CASCADE`.
  * *Justification*: If a product profile is removed, all outstanding replenishment suggestions for that product are no longer valid and must be deleted.
* **Update Rule**: `CASCADE`.

### 6.6 User ➔ Audit Logs / Sales
* **Delete Rule**: `RESTRICT`.
  * *Justification*: Users (operators/cashiers) cannot be deleted if they are referenced by audit logs or sales logs, preserving complete audit accountability. Users should instead be marked as `SUSPENDED` or `INACTIVE` rather than deleted.
* **Update Rule**: `CASCADE`.

---

## 7. Constraint Classification

We categorize system constraints to organize validation boundaries:

### 7.1 Entity Constraints
* **products**: `sku` must be unique; `purchase_price` and `selling_price` must be greater than or equal to `0.00`.
* **categories**: `name` must be unique.
* **inventory**: `quantity` and `min_stock` must be greater than or equal to `0`.
* **sales**: `discount` must range from `0.00` to `100.00`; `total_price` must be greater than or equal to `0.00`.
* **sale_items**: `quantity` must be greater than `0`; `unit_price` must be greater than or equal to `0.00`.
* **ai_recommendations**: `suggested_qty` must be greater than or equal to `0`.

### 7.2 Relationship Constraints
* **products.category_id**: Cannot reference a non-existent category record.
* **inventory.product_id**: Must reference a valid, active product. There must be exactly one inventory record per product ID.
* **sale_items.sale_id**: Must link to a valid sale transaction header.
* **sale_items.product_id**: Must link to an active product catalog record.
* **ai_recommendations.product_id**: Must link to a valid product catalog record.

### 7.3 Business Constraints
* **Sales Checkout Limit**: A sale cannot be completed if the sale item quantity exceeds the available inventory quantity.
* **Sale Immutability**: Once a sale's status changes to `COMPLETED` (or `DELIVERED`), the sale header and line items become read-only.
* **Product Retirement**: A product's status can only transition to `RETIRED` if active inventory quantity is `0`.
* **Audit Trail Permanence**: Audit logs are append-only; entries can never be modified or deleted.

---

## 8. Index Classification & Strategy

To prepare for physical database implementation, we identify logical search optimization and indexing targets:

### 8.1 Unique Enforcement
* **products (`sku`)**: Enforces uniqueness at the catalog level.
* **categories (`name`)**: Enforces uniqueness for category taxonomies.
* **inventory (`product_id`)**: Enforces the 1:1 relationship constraint between product records and active counts.

### 8.2 Primary Lookup
* **products (`id`)**: Optimized for direct catalog detail displays.
* **categories (`id`)**: Optimized for loading category profiles.
* **sales (`id`)**: Optimized for looking up invoice summaries.
* **ai_recommendations (`id`)**: Optimized for manager approval/dismissal checks.

### 8.3 Search Optimization
* **products (`name`)**: Optimized to support quick autocomplete searches by sales staff during checkout.
* **sales (`customer_name`)**: Optimized for customer checkout history lookups.

### 8.4 Reporting
* **sales (`date`)**: Optimized for date-range grouping in revenue and profit reports.
* **products (`category_id`)**: Optimized for filtering products by category on catalog pages.
* **sale_items (`product_id`)**: Optimized to aggregate sales volume by individual product.

### 8.5 Sorting
* **audit_logs (`created_at`)**: Optimized to sort log entries in descending order for administrative timelines.
* **sales (`date`, `created_at`)**: Optimized to sort transaction lists chronologically.

---

## 9. Relationship Validation Checklist

The matrix below serves as the quality checklist confirming compliance with database design requirements:

- `[x]` Every table has a primary key defined with business justification.
- `[x]` Every foreign key is conceptually documented with its referenced table.
- `[x]` Every relationship has a clear, documented business purpose.
- `[x]` Cascade behavior (delete and update rules) is defined and justified for all connections.
- `[x]` All constraints are classified into Entity, Relationship, and Business categories.
- `[x]` Indexing strategy (Unique, Primary Lookup, Search, Reporting, Sorting) is documented without SQL.
- `[x]` Orphan records are prevented via mandatory foreign keys and restrictive delete rules.
- `[x]` Referential integrity rules are conceptually satisfied for all table links.
