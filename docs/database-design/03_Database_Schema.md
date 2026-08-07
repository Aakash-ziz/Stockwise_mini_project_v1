# StockWise — Logical Database Schema

This document details the logical database schema layout for StockWise. It outlines the logical column definitions, validation rules, business constraints, examples, sensitivity classifications, searchability, and future expansion fields for the tables required in the MVP.

No SQL (`CREATE TABLE` or constraints), primary keys, foreign keys, cardinality, indexes, physical relationships, or database normalization are defined in this document. All types are defined using logical data types (e.g., String, Decimal, Integer, Boolean, DateTime) rather than physical types (e.g., VARCHAR, TIMESTAMP).

---

## 1. Table: `products`

### 1.1 Table Overview
* **Table Name**: `products`
* **Business Description**: Stores master profiles of all retail items cataloged for sale.
* **Business Purpose**: Serves as the central repository for product identifiers, descriptions, categorization references, and base cost parameters.
* **Estimated Record Volume**: ~1,000 to 5,000 products initially; slow growth (~10-20 additions per month).

### 1.2 Logical Column Definitions

| Column Name | Business Description | Logical Data Type | Nullable | Default Value | Validation Rules | Column Purpose | Business Constraints | Business Example | Sensitive Data Classification | Searchable |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **id** | System-generated unique product identifier | String | No | None | Must be a unique UUID format string | Uniquely identifies a product profile | Cannot be modified after creation | `prod-98f2a` | Internal | No |
| **name** | Full merchant title of the product | String | No | None | Cannot be empty; max 150 chars | Display name for invoices and search | Trimming leading/trailing whitespace | `MacBook Pro M2` | Public | Yes |
| **sku** | Stock Keeping Unit code | String | No | None | Alphanumeric and dashes only | Unique vendor identifier code | Must be unique across all products | `SKU-29384` | Public | Yes |
| **category_id** | Reference link to the category taxonomy | String | No | None | Must reference a valid category | Grouping association | Category must exist | `cat-electronics` | Public | Yes |
| **purchase_price** | Unit cost price paid to the supplier | Decimal | No | `0.00` | Must be greater than or equal to `0.00` | Financial valuation reference | Price cannot be negative | `1850.00` | Internal | No |
| **selling_price** | Retail unit price charged to customers | Decimal | No | `0.00` | Must be greater than or equal to `0.00` | Pricing at checkout | Price cannot be negative | `2499.00` | Public | No |
| **thumbnail_color**| Color code hex representation | String | Yes | `#CCCCCC` | Valid 7-character hex value (e.g. #FFFFFF) | Visual thumbnail representation | Hex code validation rules | `#F3F4F6` | Public | No |
| **thumbnail_icon** | Icon name keyword | String | Yes | `box` | Alphanumeric keyword name | Visual mockup render keyword | Keyword must be in allowed list | `laptop` | Public | No |
| **status** | Active workflow state indicator | String | No | `ACTIVE` | Allowed: `ACTIVE`, `INACTIVE`, `RETIRED` | Tracks availability state | Must be in allowed list | `ACTIVE` | Public | Yes |

### 1.3 Audit Fields
* **created_at** (DateTime | Required | Default: Current Time): Logs product registration time. (Audit Reason: Required for compliance and timing analytics).
* **updated_at** (DateTime | Required | Default: Current Time): Logs product changes. (Audit Reason: Required to track catalog sync delays).
* **deleted_at** (DateTime | Nullable | Default: Null): Holds timestamp for soft-deletion. (Audit Reason: Soft-delete is required to keep historical sales logs intact).
* **created_by** (String | Nullable | Default: Null): Records the ID of the user who registered the product. (Audit Reason: Captures accountability).
* **updated_by** (String | Nullable | Default: Null): Records the ID of the user who last modified the product. (Audit Reason: Tracks edits for auditing).

### 1.4 Required vs Optional Fields
* **Required Fields**: `id`, `name`, `sku`, `category_id`, `purchase_price`, `selling_price`, `status`, `created_at`, `updated_at`
* **Optional Fields**: `thumbnail_color`, `thumbnail_icon`, `deleted_at`, `created_by`, `updated_by`
* **System Managed Fields**: `id`, `created_at`, `updated_at`, `deleted_at`
* **Future Fields**: `barcode`, `image_url`, `brand`, `supplier_id`

### 1.5 Future Expansion Notes
* **Barcode Support**: Future addition of an alphanumeric `barcode` column for quick scanning.
* **Product Images**: Future media tables or `image_urls` array referencing storage.
* **Supplier Ties**: Future linking to supplier contracts using a `supplier_id` field.

### 1.6 Table Summary
* **Table Purpose**: Catalog metadata storage.
* **Estimated Growth**: Low (~10-20 rows/month).
* **Frequently Updated**: No.
* **Frequently Queried**: Yes (constantly queried during search and sales checkouts).

---

## 2. Table: `categories`

### 2.1 Table Overview
* **Table Name**: `categories`
* **Business Description**: Stores reference categories to group products.
* **Business Purpose**: Used for searching and sorting products, and generating product velocity reports.
* **Estimated Record Volume**: ~10 to 50 active categories; near-zero growth.

### 2.2 Logical Column Definitions

| Column Name | Business Description | Logical Data Type | Nullable | Default Value | Validation Rules | Column Purpose | Business Constraints | Business Example | Sensitive Data Classification | Searchable |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **id** | Unique category identifier | String | No | None | Must be a unique UUID format string | Uniquely identifies a category | Cannot be modified after creation | `cat-electronics`| Public | No |
| **name** | Full title of the category | String | No | None | Unique; cannot be empty; max 50 chars | Display title | Must be unique | `Electronics` | Public | Yes |
| **description**| Purpose of the category | Text | Yes | None | Max 250 characters | Informational descriptions | Validation length check | `Devices and laptop accessories` | Public | No |

### 2.3 Audit Fields
* **created_at** (DateTime | Required): Track creation. (Audit Reason: Logging and audit trail).
* **updated_at** (DateTime | Required): Track updates. (Audit Reason: Logging updates).
* **deleted_at** (DateTime | Nullable): Soft deletes categories. (Audit Reason: Allow categories to retire without corrupting product links).
* **created_by** (String | Nullable) & **updated_by** (String | Nullable): Future audit controls. (Audit Reason: User accountability).

### 2.4 Required vs Optional Fields
* **Required Fields**: `id`, `name`, `created_at`, `updated_at`
* **Optional Fields**: `description`, `deleted_at`, `created_by`, `updated_by`
* **System Managed Fields**: `id`, `created_at`, `updated_at`, `deleted_at`
* **Future Fields**: `parent_category_id` (hierarchy support).

### 2.5 Future Expansion Notes
* **Hierarchy**: Add a `parent_category_id` reference to support subcategories (e.g. Peripherals under Electronics).

### 2.6 Table Summary
* **Table Purpose**: Category classifications.
* **Estimated Growth**: Very Low (Rarely changed).
* **Frequently Updated**: No.
* **Frequently Queried**: Yes (loaded during dashboard initialization).

---

## 3. Table: `inventory`

### 3.1 Table Overview
* **Table Name**: `inventory`
* **Business Description**: Tracks real-time quantities, thresholds, and health status of products.
* **Business Purpose**: Enforces stock constraints, monitors threshold metrics, and warns about low stock/out of stock.
* **Estimated Record Volume**: Identical to `products` (1:1 conceptual mapping). ~1,000 to 5,000 rows.

### 3.2 Logical Column Definitions

| Column Name | Business Description | Logical Data Type | Nullable | Default Value | Validation Rules | Column Purpose | Business Constraints | Business Example | Sensitive Data Classification | Searchable |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **id** | Unique inventory record identifier | String | No | None | Must be a unique UUID format string | Uniquely identifies inventory record | Cannot be modified after creation | `inv-77281` | Internal | No |
| **product_id** | Link referencing the associated product | String | No | None | Must reference a valid product ID | Associates inventory with product details | 1:1 mapping; must be unique link | `prod-98f2a` | Public | Yes |
| **quantity** | Current count of items in stock | Integer | No | `0` | Must be greater than or equal to `0` | Active stock levels | Quantity cannot be negative | `42` | Internal | No |
| **min_stock** | Minimum threshold alert level | Integer | No | `5` | Must be greater than or equal to `0` | Defines low stock boundary | Threshold cannot be negative | `10` | Internal | No |
| **status** | Real-time computed health status | String | No | `IN STOCK` | Allowed: `IN STOCK`, `LOW STOCK`, `OUT OF STOCK` | Immediate visual flags | Must be dynamically computed | `LOW STOCK` | Public | Yes |

### 3.3 Audit Fields
* **created_at** (DateTime | Required) & **updated_at** (DateTime | Required): Track updates. (Audit Reason: Critical to audit when stock level was last updated).
* **deleted_at** (DateTime | Nullable): Soft delete inventory record when product is deleted. (Audit Reason: Retain history).
* **created_by** (String | Nullable) & **updated_by** (String | Nullable): (Audit Reason: Identifies who modified stock counts or min thresholds).

### 3.4 Required vs Optional Fields
* **Required Fields**: `id`, `product_id`, `quantity`, `min_stock`, `status`, `created_at`, `updated_at`
* **Optional Fields**: `deleted_at`, `created_by`, `updated_by`
* **System Managed Fields**: `id`, `status` (auto-computed by inventory logic), `created_at`, `updated_at`
* **Future Fields**: `warehouse_id`, `bin_location`, `batch_number`

### 3.5 Future Expansion Notes
* **Warehousing**: Add `warehouse_id` and `bin_location` to support multi-warehouse stock allocations.
* **Traceability**: Add `batch_number` and `expiry_date` for batch-tracked items.

### 3.6 Table Summary
* **Table Purpose**: Live stock balance tracking.
* **Estimated Growth**: Low (grows 1:1 with products).
* **Frequently Updated**: Yes (updated with every purchase, sale, or manual adjustment).
* **Frequently Queried**: Yes (queried constantly for quantity validation).

---

## 4. Table: `sales`

### 4.1 Table Overview
* **Table Name**: `sales`
* **Business Description**: Logs header records of checkout transactions.
* **Business Purpose**: Stores metadata, financial summary, and customer associations of completed sales.
* **Estimated Record Volume**: ~10,000 to 50,000 transactions per year; fast growth.

### 4.2 Logical Column Definitions

| Column Name | Business Description | Logical Data Type | Nullable | Default Value | Validation Rules | Column Purpose | Business Constraints | Business Example | Sensitive Data Classification | Searchable |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **id** | Unique sale transaction identifier | String | No | None | Must be unique transaction ID format | Transaction key identifier | Immutable once completed | `TXN-90231` | Public | Yes |
| **customer_name**| Name of the customer | String | Yes | `Walk-in` | Max 100 characters | Customer references | Length constraints | `Alexander Thorne`| Confidential | Yes |
| **discount** | Discount percentage applied | Decimal | No | `0.00` | Range: `0.00` to `100.00` | Percentage discount | Cannot be negative | `5.00` | Internal | No |
| **total_price** | Total revenue before updates | Decimal | No | `0.00` | Must be greater than or equal to `0.00` | Final total invoice balance | Total cannot be negative | `198.00` | Internal | No |
| **status** | Fulfillment status | String | No | `DELIVERED`| Allowed: `DELIVERED`, `PROCESSING`, `ON HOLD` | Checkout fulfillment tracker | Must be in allowed list | `DELIVERED` | Internal | Yes |
| **date** | Transaction execution date | Date | No | Current Date| Valid ISO date format | Calendar revenue reports | Date cannot be in the future | `2026-07-01` | Public | Yes |

### 4.3 Audit Fields
* **created_at** (DateTime | Required) & **updated_at** (DateTime | Required): Track creation. (Audit Reason: Immutability checks; creation time cannot change).
* **deleted_at** (DateTime | Nullable): Soft deletes transactions. (Audit Reason: Tax and compliance audits require that transaction records are **never** hard-deleted).
* **created_by** (String | Nullable): Captures checkout cashier. (Audit Reason: Essential audit trailing).
* **updated_by** (String | Nullable): Log any authorized corrections. (Audit Reason: Tracks modifications to processing sales).

### 4.4 Required vs Optional Fields
* **Required Fields**: `id`, `discount`, `total_price`, `status`, `date`, `created_at`, `updated_at`
* **Optional Fields**: `customer_name`, `deleted_at`, `created_by`, `updated_by`
* **System Managed Fields**: `id`, `total_price`, `date`, `created_at`
* **Future Fields**: `payment_method`, `tax_amount`, `store_id`

### 4.5 Future Expansion Notes
* **Auditing/Finance**: Future additions of `payment_method` (Cash, Card, Web), `tax_amount` values, and multi-store `store_id` identifiers.

### 4.6 Table Summary
* **Table Purpose**: Invoice transaction logs.
* **Estimated Growth**: High (~50-200 entries daily).
* **Frequently Updated**: No (immutable transactional logs; rarely changed post-checkout).
* **Frequently Queried**: Yes (financial audits and daily reports).

---

## 5. Table: `sale_items`

### 5.1 Table Overview
* **Table Name**: `sale_items`
* **Business Description**: Stores line-item quantities and prices charged for products in a transaction.
* **Business Purpose**: Detail-level records of transactions to support inventory deductions, return tracking, and unit profit margins.
* **Estimated Record Volume**: ~30,000 to 150,000 records per year (scales with sales); very fast growth.

### 5.2 Logical Column Definitions

| Column Name | Business Description | Logical Data Type | Nullable | Default Value | Validation Rules | Column Purpose | Business Constraints | Business Example | Sensitive Data Classification | Searchable |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **id** | Unique item line identifier | String | No | None | Must be a unique UUID format string | Uniquely identifies line item | Cannot change post creation | `sli-88319` | Internal | No |
| **sale_id** | Link referencing the parent sale | String | No | None | Must reference a valid sale ID | Connects item to invoice | Parent transaction must exist | `TXN-90231` | Internal | Yes |
| **product_id** | Link referencing the sold product | String | No | None | Must reference a valid product ID | Identifies sold item | Product must exist | `prod-1` | Public | Yes |
| **quantity** | Number of units purchased | Integer | No | `1` | Must be greater than `0` | Quantities sold | Quantity must be positive | `2` | Internal | No |
| **unit_price** | Unit price locked at sale | Decimal | No | `0.00` | Must be greater than or equal to `0.00` | Historic sale price | Price cannot be negative | `99.00` | Public | No |

### 5.3 Audit Fields
* **created_at** (DateTime | Required) & **updated_at** (DateTime | Required): Track logs. (Audit Reason: Matches checkout logging).
* **deleted_at** (DateTime | Nullable): Soft delete. (Audit Reason: Compliance protection).
* **created_by** (String | Nullable) & **updated_by** (String | Nullable): Future logs. (Audit Reason: Accountability details).

### 5.4 Required vs Optional Fields
* **Required Fields**: `id`, `sale_id`, `product_id`, `quantity`, `unit_price`, `created_at`, `updated_at`
* **Optional Fields**: `deleted_at`, `created_by`, `updated_by`
* **System Managed Fields**: `id`, `created_at`
* **Future Fields**: `return_status`, `discount_applied`

### 5.5 Future Expansion Notes
* **Returns**: Future addition of a `return_status` column (e.g. Active, Returned, Exchanged) to manage partial order returns.

### 5.6 Table Summary
* **Table Purpose**: Transaction line items detail.
* **Estimated Growth**: Very High (~150-600 rows daily).
* **Frequently Updated**: No (immutable post-sale).
* **Frequently Queried**: Yes (for sales summary charts and dashboard velocity reports).

---

## 6. Table: `ai_recommendations`

### 6.1 Table Overview
* **Table Name**: `ai_recommendations`
* **Business Description**: Stores advisory alerts generated by systems monitoring stock health and sales velocity.
* **Business Purpose**: Holds actionable replenishment suggestions to prevent stockouts and minimize excess stock.
* **Estimated Record Volume**: ~100 to 500 records; moderate growth.

### 6.2 Logical Column Definitions

| Column Name | Business Description | Logical Data Type | Nullable | Default Value | Validation Rules | Column Purpose | Business Constraints | Business Example | Sensitive Data Classification | Searchable |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **id** | Unique recommendation identifier | String | No | None | Must be a unique UUID format string | Identifies specific suggestion | Cannot be modified after creation | `rec-99120` | Internal | No |
| **product_id** | Reference link to the target product | String | No | None | Must reference a valid product ID | Identifies product to replenish | Product must exist | `prod-2` | Public | Yes |
| **type** | Nature of the advisory action | String | No | `LOW_STOCK` | Allowed: `LOW_STOCK`, `EXCESS_INVENTORY`, `AUDIT_REQUIRED` | Rationale selector | Must match allowed types | `LOW_STOCK` | Internal | Yes |
| **title** | Short alert title | String | No | None | Max 100 characters | Summary header | Title length limitations | `Low Stock Alert` | Public | Yes |
| **description**| Detailed explanation of the recommendation | Text | No | None | Max 500 characters | Explanation details | Description constraints | `Sony WH-1000XM5 has 5 units remaining (threshold: 10)` | Public | No |
| **suggested_qty**| Target replenishment units | Integer | Yes | `0` | Must be greater than or equal to `0` | Recommended restock quantity | Quantity cannot be negative | `25` | Internal | No |
| **status** | State of the recommendation | String | No | `PENDING` | Allowed: `PENDING`, `APPROVED`, `DISMISSED`, `EXPIRED` | Recommendation pipeline tracking | Must match allowed options | `PENDING` | Internal | Yes |

### 6.3 Audit Fields
* **created_at** (DateTime | Required): Tracks when recommendations were published. (Audit Reason: Tracks algorithm timing).
* **updated_at** (DateTime | Required): Tracks status changes. (Audit Reason: Essential to calculate lead times for managers to act on alerts).
* **deleted_at** (DateTime | Nullable): Soft deletion support. (Audit Reason: Protects historical analytics).
* **created_by** (String | Nullable) & **updated_by** (String | Nullable): Tracks which manager approved or dismissed the alert. (Audit Reason: Evaluates team responsiveness).

### 6.4 Required vs Optional Fields
* **Required Fields**: `id`, `product_id`, `type`, `title`, `description`, `status`, `created_at`, `updated_at`
* **Optional Fields**: `suggested_qty`, `deleted_at`, `created_by`, `updated_by`
* **System Managed Fields**: `id`, `created_at`
* **Future Fields**: `lead_time_days`, `vendor_id`

### 6.5 Future Expansion Notes
* **Supplier Automation**: Future fields mapping `vendor_id` and tracking `lead_time_days` to automatically pre-fill purchase order sheets.

### 6.6 Table Summary
* **Table Purpose**: replenishment alert logging.
* **Estimated Growth**: Moderate (~10-50 alerts generated weekly).
* **Frequently Updated**: Yes (status transitions from Pending to Approved/Dismissed).
* **Frequently Queried**: Yes (checked on manager login and dashboard loads).

---

## 7. Table: `audit_logs`

### 7.1 Table Overview
* **Table Name**: `audit_logs`
* **Business Description**: Stores an append-only transaction history of critical events (price updates, manual adjustments, profile edits).
* **Business Purpose**: Ensures traceability and compliance.
* **Estimated Record Volume**: ~5,000 to 25,000 logs; steady growth.

### 7.2 Logical Column Definitions

| Column Name | Business Description | Logical Data Type | Nullable | Default Value | Validation Rules | Column Purpose | Business Constraints | Business Example | Sensitive Data Classification | Searchable |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **id** | Unique audit record identifier | String | No | None | Must be a unique UUID format string | Uniquely identifies audit log entry | Must be unique | `aud-55102` | Audit | No |
| **actor_id** | System reference of user initiating the change | String | No | None | Valid user identifier format | Identifies user | User must be recorded | `usr-admin1` | Audit | Yes |
| **action_type** | Type of change executed | String | No | None | Allowed: `CREATE`, `UPDATE`, `DELETE`, `STOCK_ADJUSTMENT`, `PRICE_CHANGE` | Categorization of event | Must match list of allowed types | `STOCK_ADJUSTMENT` | Audit | Yes |
| **entity_name** | Name of the table altered | String | No | None | Valid database table name string | Target category | Table must exist | `inventory` | Audit | Yes |
| **entity_id** | Key identifying the specific record changed | String | No | None | Valid UUID identifier string | Target row link | Targets specific instance | `inv-77281` | Audit | Yes |
| **previous_value**| Snapshot of changed attributes before event | Text | Yes | None | Valid JSON metadata string | Records pre-state | Nullable for creations | `{"quantity": 42}` | Audit | No |
| **new_value** | Snapshot of changed attributes after event | Text | Yes | None | Valid JSON metadata string | Records post-state | Nullable for deletions | `{"quantity": 38}` | Audit | No |
| **reason** | Business reason for the audit logging | Text | Yes | None | Max 250 characters | Document reason | Validation length checks | `Logged 4 damaged headphones` | Audit | Yes |

### 7.3 Audit Fields
* **created_at** (DateTime | Required | Default: Current Time): Logs log timestamp. (Audit Reason: Audit log must be immutable, and timestamp must be automatically managed by the system).
* **updated_at** (DateTime | Nullable | Default: Null): Typically unused since log is append-only. (Audit Reason: Audit records must never be updated).
* **deleted_at** (DateTime | Nullable | Default: Null): Typically unused since log is append-only. (Audit Reason: Audit records must never be deleted).
* **created_by** (String | Nullable | Default: Null): Same as actor_id.
* **updated_by** (String | Nullable | Default: Null): Unused.

### 7.4 Required vs Optional Fields
* **Required Fields**: `id`, `actor_id`, `action_type`, `entity_name`, `entity_id`, `created_at`
* **Optional Fields**: `previous_value`, `new_value`, `reason`
* **System Managed Fields**: `id`, `created_at`
* **Future Fields**: `client_ip_address`, `session_token`

### 7.5 Future Expansion Notes
* **Security Logs**: Adding `client_ip_address` and `session_token` to monitor potential external breach logs.

### 7.6 Table Summary
* **Table Purpose**: Immutable compliance log.
* **Estimated Growth**: Moderate to High (grows with manual edits and status changes).
* **Frequently Updated**: No (Append-only. Modified value updates are strictly forbidden).
* **Frequently Queried**: No (rarely queried except during system-wide reviews).

---

## 8. Logical Table Completeness Check

The following checklist validates that all tables in this logical database schema document are complete and meet requirements:

| Table Name | Description | Purpose | Columns | Logical Data Types | Nullability | Default Values | Validation Rules | Audit Fields | Searchability | Security Classification | Ready for Modeling |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `products` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **Yes** |
| `categories` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **Yes** |
| `inventory` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **Yes** |
| `sales` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **Yes** |
| `sale_items` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **Yes** |
| `ai_recommendations`| Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **Yes** |
| `audit_logs` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **Yes** |
