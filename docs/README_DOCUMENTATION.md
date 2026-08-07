# StockWise Documentation Directory

Welcome to the StockWise project documentation directory. This folder contains all system architecture specifications, design manuals, and database blueprints required to understand, develop, and maintain the StockWise application.

---

## 1. Directory Structure

```text
StockWise/docs/
│
├── database-design/
│   ├── 01_Business_Domain_Analysis.md
│   ├── 02_Entity_Analysis.md
│   ├── 03_Database_Schema.md
│   ├── 04_Relationship_Analysis.md
│   ├── 05_ER_Diagram.md
│   ├── 06_Normalization_Report.md
│   ├── 07_Database_Review.md
│   └── 08_StockWise_Database_Blueprint.md
│
├── Backend_Architecture.md
├── Integration_Readiness_Report.md
├── API_Debug_Report.md
├── Mock_Removal_Report.md
├── Error_Handling_Review.md
├── Frontend_Backend_Integration_Report.md
├── Product_Validation_Debug_Report.md
├── Manual_Test_Report.md
├── Final_QA_Report.md
├── CONFIGURATION.md
├── DESIGN.md
├── SERVICES.md
├── UI_STATES.md
└── README_DOCUMENTATION.md (This File)
```

---

## 2. Database Design Phase Progression & Reading Order

The database design documents are organized sequentially with numerical prefixes to guide readers from core business conceptualization to final structural approval.

### [Phase 1: Conceptualization & Business Analysis]
1. **[01_Business_Domain_Analysis.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/database-design/01_Business_Domain_Analysis.md)**
   * *Purpose*: Documents how the business operates conceptually, detailing inventory workflows, sales workflows, and AI recommendations without database/SQL definitions.
2. **[02_Entity_Analysis.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/database-design/02_Entity_Analysis.md)**
   * *Purpose*: Discovers all core and supporting business entities, outlining their boundaries, lifecycles, and business rules.

### [Phase 2: Logical Schema Modeling]
3. **[03_Database_Schema.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/database-design/03_Database_Schema.md)**
   * *Purpose*: Maps logical tables, column attributes, default values, sensitivity levels, and validation constraints using conceptual data types.
4. **[04_Relationship_Analysis.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/database-design/04_Relationship_Analysis.md)**
   * *Purpose*: Establishes primary/foreign keys, relationship cardinalities (1:1, 1:M), cascade behaviors (RESTRICT/CASCADE), and index classifications.
5. **[05_ER_Diagram.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/database-design/05_ER_Diagram.md)**
   * *Purpose*: Visualizes table linkages and primary/foreign key connections using Mermaid notation.

### [Phase 3: Validation, Assessment, & Final Blueprint]
6. **[06_Normalization_Report.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/database-design/06_Normalization_Report.md)**
   * *Purpose*: Assesses all logical tables against 1NF, 2NF, and 3NF parameters, analyzing functional dependencies and justifying necessary price snapshots.
7. **[07_Database_Review.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/database-design/07_Database_Review.md)**
   * *Purpose*: Scores design quality (9.8/10), conducts risk assessments, maps deployment readynesses, and formally approves the logical architecture.
8. **[08_StockWise_Database_Blueprint.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/database-design/08_StockWise_Database_Blueprint.md) (Master Source of Truth)**
   * *Purpose*: Consolidates all 7 preceding documents into a single master blueprint reference for development.

---

## 3. General Design Documentation

* **[Backend_Architecture.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/Backend_Architecture.md)**: Defines the backend layered folder architecture, Zod validator hooks, request flow, and central database transaction guides.
* **[Integration_Readiness_Report.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/Integration_Readiness_Report.md)**: Audits the full-stack interface compatibility, detailing data model flattening and response adapters.
* **[API_Debug_Report.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/API_Debug_Report.md)**: Investigates frontend-backend communication failures, detailing ts-node-dev loaders and port fixes.
* **[Mock_Removal_Report.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/Mock_Removal_Report.md)**: Details the migration from mock-driven development to a fully backend-driven application after cleanup.
* **[Error_Handling_Review.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/Error_Handling_Review.md)**: Audits full-stack error states, loading skeletons, partial outages, and timeout scenarios.
* **[Frontend_Backend_Integration_Report.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/Frontend_Backend_Integration_Report.md)**: Details E2E system testing covering products CRUD, transaction carts, and reports refresh.
* **[Product_Validation_Debug_Report.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/Product_Validation_Debug_Report.md)**: Documents root cause analysis and schemas configuration updates resolving mutation validation errors.
* **[Manual_Test_Report.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/Manual_Test_Report.md)**: Details manual functional user testing, working states, and overall module stability scores.
* **[Final_QA_Report.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/Final_QA_Report.md)**: Details total system audits, security parameters, accessibility metrics, and a production readiness index.
* **[DESIGN.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/DESIGN.md)**: Details the brand guidelines, typography system, spacing, colors, and minimalistic component rules.
* **[SERVICES.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/SERVICES.md)**: Explains the coordination layer architecture mapping React Context hooks to async mock service layers.
* **[UI_STATES.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/UI_STATES.md)**: Standardizes feedback state interactions (Loading Skeletons, Empty Prompts, Error alerts).
* **[CONFIGURATION.md](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/CONFIGURATION.md)**: Manages dynamic environment variables, local staging configs, and security protocols.

---

## 4. Instructions for Backend Developers

Backend developers must adhere to the following principles during physical database implementation:
1. **Master Blueprint Reference**: Always use the **[Master Database Blueprint (08_StockWise_Database_Blueprint.md)](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/docs/database-design/08_StockWise_Database_Blueprint.md)** as the primary source of truth for tables, logical types, constraints, indices, and validation rules.
2. **DDL Creation**: Map the logical types to PostgreSQL equivalents (e.g. Logical String UUID to physical `UUID` primary keys, Logical Decimal to `NUMERIC(12, 2)`).
3. **Fulfill Constraints**: Enforce the specified constraints (e.g. check constraints verifying non-negative stocks, unique SKUs) at the database schema level.
4. **Transaction Management**: Ensure checkout routines (updating stock counts and logging sales) are executed within atomic database transactions with appropriate locking to prevent concurrency race conditions.
5. **Auditing hooks**: Register database triggers or interceptor handlers to automatically append to the `audit_logs` table upon manual adjustments or product catalog price changes.
