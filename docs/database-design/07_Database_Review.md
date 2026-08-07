# StockWise — Database Review

This document provides a comprehensive review of the logical database design for the StockWise application. It evaluates the architecture against software design principles, scores its design components, evaluates potential operational risks, outlines a phased roadmap for future scaling, assesses deployment readiness, and provides an executive summary and final approval recommendation.

No SQL scripts, CREATE/ALTER syntax, index tuning, or backend codebase alterations are introduced in this review.

---

## 1. Architecture Principles Review

We evaluate how closely the logical database design aligns with core software architecture principles:

* **Separation of Concerns (SoC)**: **Highly Aligned**. The schema separates product details (`products`) from product classification (`categories`), active balances (`inventory`), invoice metadata (`sales`), and transactional lists (`sale_items`). Each table manages its own domain.
* **Single Responsibility Principle (SRP)**: **Aligned**. Each table is responsible for a single task. For example, `products` only stores identity and pricing metadata, while the `inventory` table is solely responsible for real-time stock balances and safety levels.
* **Extensibility**: **Highly Aligned**. The clean relational boundary design allows adding new features (like multiple warehouses, barcode scanning, or variant options) by adding supporting columns or linking tables without having to modify the existing table cores.
* **Maintainability**: **Aligned**. Because the structure is normalized to 3NF, data is stored in single locations (with logical exceptions for audit snapshots). This eliminates redundancy anomalies and makes logic updates straightforward.
* **Consistency**: **Highly Aligned**. The schema enforces strict logical constraints (such as non-negative stock counts and unique SKUs) and defines clean CASCADE/RESTRICT behaviors. This guarantees relational integrity across all database transactions.
* **Simplicity**: **Aligned**. The design remains lightweight, mapping only 8 tables for the MVP. It avoids over-engineering by excluding complex hierarchical permissions or multi-warehouse configurations from the initial MVP phase.

---

## 2. Database Quality Scorecard

We evaluate the design quality of the database architecture across 12 criteria (0 to 10):

### 2.1 Naming Conventions: 10 / 10
* *Justification*: Consistent use of snake_case for tables and columns (e.g. `category_id`, `purchase_price`), matching standard database conventions.

### 2.2 Schema Design: 9.8 / 10
* *Justification*: The logical structures map directly to the discovered business entities. Clear column purposes, logical types, and validation rules are defined for every attribute.

### 2.3 Relationships: 9.8 / 10
* *Justification*: 1:1 and 1:M relationships are conceptually clear. Delete and update rules (RESTRICT and CASCADE) are defined to prevent database anomalies.

### 2.4 Normalization: 9.7 / 10
* *Justification*: Achieved full 3NF across all tables. Controlled duplicates (like checkout prices) are implemented to preserve audit history.

### 2.5 Scalability: 9.5 / 10
* *Justification*: The separation of high-volume tables (`sales` and `sale_items`) from catalog tables prepares the database for clustering, partitioning, and read-replicas as transaction volumes grow.

### 2.6 Performance Readiness: 9.5 / 10
* *Justification*: Key indexing strategies (Primary Lookups, Unique constraints, Search optimizations) are identified conceptually, easing physical index creation.

### 2.7 Security Readiness: 9.2 / 10
* *Justification*: Columns are classified into Public, Internal, Confidential, and Audit tiers, preparing the database for row-level permissions or encryption policies in future phases.

### 2.8 Data Integrity: 9.8 / 10
* *Justification*: Core constraints (non-negative price, non-negative quantity, unique SKU, immutable audits) are defined to prevent data corruption.

### 2.9 AI Readiness: 9.5 / 10
* *Justification*: The `ai_recommendations` table is integrated to record replenishment alerts. Essential algorithm inputs (sales velocity, stock health, min threshold) are tracked.

### 2.10 Reporting Support: 9.8 / 10
* *Justification*: Storing historical unit prices and checkout timestamps guarantees accurate retroactive profit analysis, revenue calculations, and product velocity reporting.

### 2.11 Maintainability: 9.8 / 10
* *Justification*: Decoupled tables ensure modifications to one business domain (e.g. adding supplier fields) do not impact others.

### 2.12 Documentation Quality: 10 / 10
* *Justification*: Comprehensive coverage across Business, Entity, Schema, Relationship, Normalization, and ER Diagram documents, complete with legends, checklists, and examples.

---

## 3. Risk Assessment

We identify and categorize operational and database risks:

### 3.1 High-Level Risks
* **Risk: Concurrent Stock Updates**
  * *Description*: Multiple sales completed at the same millisecond could result in race conditions, causing inaccurate inventory balances.
  * *Impact*: High. Can lead to negative stock levels or unrecognized stockouts, violating core business rules.
  * *Mitigation*: Implement pessimistic locking or database transaction isolation levels (e.g., Serializable) during checkout operations at the database engine level.

### 3.2 Medium-Level Risks
* **Risk: Product Deletion Anomaly**
  * *Description*: Deleting a product could accidentally delete related historical sales records if cascade rules are configured incorrectly.
  * *Impact*: High (financial reporting errors).
  * *Mitigation*: Enforce `RESTRICT` on product deletions. Require products to be marked as `RETIRED` rather than hard-deleted.
* **Risk: Uncached Dashboard Queries**
  * *Description*: Generating dashboard metrics (turnover, velocity) by scanning transaction history can slow down performance as data scales.
  * *Impact*: Medium (page load delays).
  * *Mitigation*: Implement cache/summary tables in the physical phase to store nightly pre-aggregated stats.

### 3.3 Low-Level Risks
* **Risk: AI Recommendation Bloat**
  * *Description*: The AI engine could generate duplicate recommendation rows.
  * *Impact*: Low (inflated database size).
  * *Mitigation*: Implement unique constraint logic checking target product and status (e.g., only allow one `PENDING` recommendation per product).

---

## 4. Future Roadmap

We map the phased expansion of the database structure to support scalability:

### 4.1 Near-Term Roadmap
* **Barcode Management**: Add a unique `barcode` string column to the `products` table.
* **Customer Profile Expansion**: Expand `customer` tracking to log shipping addresses, billing records, and contact directories.
* **Supplier & Purchase Order Tracking**: Create `suppliers`, `purchase_orders`, and `purchase_items` tables to manage procurement workflows.
* **Role-Based Permissions**: Implement user authorization checks at the database query level based on the defined `Role` and `Permission` entities.

### 4.2 Long-Term Roadmap
* **Multi-Warehouse Inventory Allocation**: Link inventory to a `warehouses` table, tracking counts per location.
* **Inventory Location Details**: Define `locations` (aisles, shelves, bins) within warehouses.
* **Product Variant Support**: Introduce parent-child product relationships to track size, color, or configuration variants under a base product.
* **Batch & Expiry Date Tracking**: Implement batch/lot number records to support perishable items.
* **Predictive AI demand analysis**: Create history logs storing seasonal trends and external factors to feed machine learning models.

---

## 5. Deployment Readiness Assessment

We evaluate the readiness of the design to proceed to physical implementation:

* **Physical SQL Schema**: **Ready**. Logical schemas, data types, constraints, and keys are defined, allowing DDL scripts to be written.
* **ORM Model Generation**: **Ready**. Table names, attributes, nullability, and relationships are documented, enabling ORM model definitions (e.g., Prisma, SQLAlchemy).
* **Database Migrations**: **Ready**. The versioned logical design is prepared for initial migration generation.
* **Backend APIs**: **Ready**. Entity boundaries and business rules are clear, enabling API controllers (CRUD, checkout) to be mapped.
* **Testing**: **Ready**. Database validation rules are defined, enabling unit tests to verify constraint violations.
* **Production Deployment**: **Staged (Requires DDL script creation)**. The architecture is ready to proceed to physical modeling.

---

## 6. Executive Summary

* **Overall Architecture Rating**: **9.8 / 10**
* **Major Strengths**:
  * **Strong Relational Integrity**: A strict 3NF design combined with validation rules prevents anomalies.
  * **Audit Compliance**: Historical checkout snapshots (`unit_price`, checkout timestamp) are preserved.
  * **AI and Reporting Integration**: Clean structures support real-time dashboards and reorder alert tracking.
  * **Roadmap Compatibility**: Prepares the database for future features like multi-warehouse and variants.
* **Areas for Improvement**:
  * Implement caching for expensive dashboard queries.
  * Enforce strict transactional locking mechanisms in the physical DDL phase to prevent checkout race conditions.
* **Final Recommendation & Approval**:
  * **APPROVED**. The logical database design is approved for physical implementation. The schema design provides a solid foundation for physical modeling, SQL creation, and API integration.
