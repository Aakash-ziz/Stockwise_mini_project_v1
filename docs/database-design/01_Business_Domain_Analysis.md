# StockWise — Business Domain Analysis

This document serves as the foundation for the StockWise system design. It details the business operations, objectives, glossary, actors, workflows, rules, stored information, and future scalability requirements of StockWise without introducing database schemas, physical tables, relationships, SQL, keys, or implementation details.

---

## 1. Business Problem

StockWise addresses critical challenges in retail and inventory operations:
* **Current Challenges in Inventory Management**:
  * **Stockouts**: Out-of-stock events lead to lost sales, damaged customer trust, and operational bottlenecks.
  * **Overstock**: Excess inventory ties up working capital, incurs holding costs, and risks product depreciation or obsolescence.
  * **Manual Counting & Human Error**: Tracking stock levels on paper or spreadsheets results in inaccurate records, delayed updates, and high administrative overhead.
  * **Lack of Real-time Visibility**: Business owners and managers struggle to see accurate stock levels across categories, leading to reactive and inefficient reordering.
* **Benefits of Digital Inventory Tracking**:
  * Enables real-time inventory tracking, ensuring immediate updates upon sale or replenishment.
  * Provides a centralized source of truth for stock quantities, prices, and suppliers.
  * Eliminates manual calculation errors, saving time and operational costs.
* **Benefits of AI-Assisted Inventory Optimization**:
  * Shifting from reactive to proactive stock management.
  * Dynamically calculates reorder points based on historical sales velocity and stock health thresholds.
  * Recommends actions (e.g., reorder, liquidate, audit) to prevent critical stockouts or excessive overstocking.

---

## 2. Business Objectives

The measurable business goals that StockWise aims to achieve include:
1. **Reduce Stockouts**: Decrease out-of-stock occurrences by at least 80% through timely low-stock detection and alerts.
2. **Reduce Overstock**: Minimize capital tied up in excess inventory by alerting managers when stock levels exceed optimal thresholds.
3. **Improve Inventory Visibility**: Maintain 99.9% inventory data accuracy between physical counts and system balances.
4. **Improve Sales Insights**: Provide real-time sales reporting and product velocity performance metrics to identify top-selling items and underperforming stock.
5. **Support AI-Assisted Inventory Optimization**: Provide automated, advisory reorder recommendations to streamline replenishment workflows.

---

## 3. Business Scope

The core operational areas of StockWise are:
* **Inventory Management**: Product registration, category categorization, pricing updates, and lifecycle management.
* **Sales Management**: Processing checkout transactions, validating item quantities, calculating totals, and deducting stock.
* **Stock Monitoring**: Real-time health classification of products (Optimal, Low Stock, Out of Stock, Overstocked).
* **Reporting & Analytics**: Dashboards mapping sales velocity, product performance (high/medium/low velocity), and total inventory valuation.
* **AI Recommendations**: Algorithmic alerts suggesting reorders or stock adjustments to optimize stock levels.
* **Future Expansion**: Scale to support multiple physical stores, warehouses, customer-facing portals, and automated supplier procurement systems.

---

## 4. Business Actors

### Administrator
* **Responsibilities**: Manages system configurations, oversees the entire store inventory and sales registry, and maintains categories.
* **Permissions**: Unrestricted access to view, create, edit, and retire products, view all sales history, access reports, and configure system-wide thresholds.
* **Interactions**: Configures product metadata, initiates stock adjustments, reviews high-level performance reports, and acts on system alerts.

### Inventory Manager
* **Responsibilities**: Ensures inventory accuracy, registers new shipments, updates product details, and executes replenishment.
* **Permissions**: View, create, and modify products, categories, and stock counts. Can view sales history and inventory health dashboards, but cannot perform administrative configuration changes.
* **Interactions**: Marks new stock as received, performs manual stock adjustments (for damaged/returned goods), and acts on reorder recommendations.

### Sales Staff
* **Responsibilities**: Assists customers, processes transactions at checkout points, and registers sales.
* **Permissions**: Search and view product catalog details (name, price, availability), create sales transactions. Cannot modify product profiles, base prices, or adjust stock levels manually.
* **Interactions**: Looks up items, validates stock quantities, completes transactions, and records client information when required.

### Store Owner
* **Responsibilities**: Reviews business health, monitors profitability, and plans long-term procurement budgets.
* **Permissions**: Read-only access to all dashboards, inventory sheets, sales records, and performance metrics.
* **Interactions**: Consumes executive reports, views AI inventory health scores, and evaluates store performance metrics.

### Supplier Portal (Future)
* **Responsibilities**: Fulfills procurement requests and updates order shipment status.
* **Permissions**: View authorized purchase orders, input delivery ETAs, and update shipment details.
* **Interactions**: Receives automated purchase orders when stock levels trigger reorder points, confirms order acceptance.

### Customer Portal (Future)
* **Responsibilities**: Browses product catalogs, checks local item availability, and places orders.
* **Permissions**: Browse active products (public details, pricing, stock availability). Create reservation orders.
* **Interactions**: Places orders, checks order status, and requests returns.

---

## 5. Business Glossary

* **Product**: A distinct retail item cataloged for sale within the system, identified by a name, SKU, price, and category.
* **SKU (Stock Keeping Unit)**: A unique alphanumeric identifier assigned to a product to track it within the inventory system.
* **Category**: A logical grouping used to organize similar products (e.g., Electronics, Peripherals, Stationery) for reporting and searching.
* **Inventory**: The physical quantity of products currently held by the store that are available for purchase.
* **Sale**: A business transaction where one or or more products are transferred to a customer in exchange for payment.
* **Stock Adjustment**: A manual intervention in the system to align digital stock records with actual physical stock (e.g., due to damage, theft, or return).
* **Reorder Point**: The minimum stock threshold for a product at which replenishment should be initiated to prevent a stockout.
* **AI Recommendation**: An advisory warning or suggestion generated by the system analyzing inventory health to prompt human action (e.g., "Reorder SKU-X").

---

## 6. Inventory Workflow

The inventory workflow tracks items from arrival to depletion:
1. **Product Creation**: A new product profile is registered with basic details (Name, SKU, Category, Purchase Price, Selling Price, Minimum Stock Threshold). Initial stock quantity can be set to zero or a starting balance.
2. **Product Updates**: Product detail adjustments (pricing, description, category re-assignment) can be made as market conditions change.
3. **Stock Received (Replenishment)**: When new shipments arrive, the inventory manager updates the product, adding the received quantity to the existing inventory balance.
4. **Stock Depletion**: When a sale is completed, the system automatically subtracts the purchased quantity from the inventory balance of that product.
5. **Manual Adjustments**: Discrepancies identified during audits, damaged goods, or customer returns trigger a manual stock adjustment, raising or lowering the inventory balance with a documented reason.
6. **Low-Stock Detection**: The system continuously monitors stock balances. If a product's quantity falls below its specified Minimum Stock Threshold, its status changes from `IN STOCK` to `LOW STOCK` or `OUT OF STOCK`.
7. **Reorder Recommendations**: Low stock triggers an automated AI reorder recommendation indicating the target quantity to procure.

---

## 7. Sales Workflow

The sales workflow enforces financial and inventory integrity:
1. **Product Selection**: The Sales Staff selects products requested by a customer (via manual search or future barcode scan).
2. **Quantity Validation**: The system validates that the requested quantity is less than or equal to the available inventory quantity. If the quantity is insufficient, the system blocks the sale.
3. **Sale Completion**: The sale is finalized. The system calculates the total price, applies any authorized discounts, and accepts transaction details.
4. **Inventory Deduction**: The system immediately deducts the sold quantity from the product’s available inventory balance.
5. **Sales Recording**: A transaction record is created documenting the sale ID, products sold, quantities, date, customer name, and total revenue.
6. **Reporting Updates**: Dashboard metrics, sales velocity lists, and product performance summaries are updated to reflect the new transaction.

---

## 8. Product Lifecycle

Products progress through the following status phases:
* **Created**: Registered in the system database. Can be modified and organized into categories.
* **Active**: Default status when stock is greater than zero and the product is visible for checkout and public inquiries.
* **Low Stock / Out of Stock**: Flags when stock levels cross thresholds, triggering reorder flows. The product remains searchable.
* **Inactive**: Temporarily suspended from active sales (e.g., seasonal items, supply chain delays). Visible to managers but cannot be selected for new sales.
* **Retired**: Permanently removed from future operations (e.g., discontinued products). The product profile is hidden from active searches but preserved in historical sales reports.

---

## 9. Stock Movement

Stock movements record the "why" and "how" of quantity adjustments:
* **Purchase (Incoming)**: Increases stock. Occurs when a supplier shipment is received and logged.
* **Sale (Outgoing)**: Decreases stock. Occurs automatically upon checkout completion.
* **Manual Adjustment (Correction)**: Increases or decreases stock to fix inventory counting errors.
* **Damaged Items (Outgoing)**: Decreases stock. Logs items rendered unsellable due to accidents, expiration, or defects.
* **Returns (Incoming/Outgoing - Future)**: Customer returns of sellable goods increase stock; returns of defective goods are logged and adjusted out.
* **Transfers (Internal - Future)**: Stock moved between different stores or warehouses. Decreases stock in the source location and increases it in the target location.

---

## 10. AI Recommendation Flow

The AI recommendation flow acts as an advisory assistant for procurement:
* **Inputs Required**:
  * Current stock level of the product.
  * Minimum stock threshold.
  * Sales Velocity (daily/weekly rate of units sold).
  * Product category and supplier lead times (future).
* **Business Objectives**:
  * Prevent stockouts before they happen.
  * Prevent excessive capital lockup by avoiding overstock.
  * Automate inventory auditing alerts.
* **Recommendation Outputs**:
  * Reorder suggestions (e.g., "Reorder 50 units of MacBook Pro M2").
  * Excess inventory warnings (e.g., "Excess stock of desk mats detected; recommend promotion/discount").
  * Audit requests (e.g., "Item showing negative adjustments; schedule inventory check").
* **Future Machine Learning Opportunities**:
  * Dynamic forecasting using seasonal trends (e.g., predicting higher keyboard sales in Q4).
  * Supplier delivery time forecasting based on historical lead times.
  * Automated price optimization suggestions based on demand elasticity.

---

## 11. Reporting Requirements

StockWise must synthesize operational data into key executive metrics:
* **Inventory Reports**: Current stock values, itemized counts, stock status distribution.
* **Sales Reports**: Daily, weekly, and monthly sales transaction registries, total revenue, and order counts.
* **Profit Analysis**: Profit margin analysis calculated from the difference between Purchase Price and Selling Price across transactions.
* **Low-Stock Reports**: Listing of all products currently below their threshold, sorted by urgency.
* **Product Performance**: Analytics displaying units sold and revenue growth, classifying products into `HIGH VELOCITY`, `STABLE`, or `SLOWING`.
* **Dashboard Metrics**: Quick-access KPI cards mapping total stock value, active alerts, inventory turnover rates, and dead stock rates.

---

## 12. Business Rules

The following core business rules govern all operations:
* **Stock Cannot Become Negative**: Under no operational circumstance can the system record a negative inventory balance for a product.
* **SKU Must Be Unique**: Every product registered must have a unique Stock Keeping Unit (SKU) code. Duplicate SKUs are rejected.
* **Products Require a Category**: Every product profile must be assigned to an active category.
* **Sales Require Available Inventory**: A sale transaction cannot be completed if any line item's requested quantity exceeds available stock.
* **Preserve Historical Sales**: Deleting or retiring a product must not erase or corrupt historical sales records or financial reporting containing that product.
* **Prices Cannot Be Negative**: Both purchase prices and selling prices must be positive numeric values. Selling price must generally exceed purchase price (except during liquidation, which requires manager override).
* **Audit Trail Permanence**: Historic stock movements and audit records cannot be edited or deleted once created.

---

## 13. Information to Store

The system must retain the following domain information:
* **Product Details**: Name, SKU, category relationship, purchase price, selling price, threshold limits, status, visual thumbnail properties.
* **Inventory Information**: Current stock quantity, primary storage location (future).
* **Sales Information**: Transaction identifier, list of sold products, quantities, prices charged, discount applied, date/time, customer details.
* **Categories**: Category names, descriptions, parent category (future).
* **Suppliers (Future)**: Company name, contact information, address, lead time parameters.
* **AI Recommendation History**: Generated warnings, suggested order quantities, creation timestamps, and resolution status (Approved/Dismissed).
* **Audit History**: Log of all stock adjustments, including timestamps, initiating actor, previous/new quantities, and reason codes.

---

## 14. Business Events

Domain events represent key changes in business state:
* **Product Created**: Fired when a new product profile is added to the catalog.
* **Product Updated**: Fired when product details, prices, or thresholds change.
* **Sale Completed**: Fired when checkout finishes, initiating stock deduction and revenue updates.
* **Stock Received**: Fired when a shipment is processed, increasing inventory counts.
* **Stock Adjusted**: Fired when manual count changes are logged (e.g. damages, audits).
* **Recommendation Generated**: Fired when stock thresholds or velocity analysis trigger a replenishment alert.
* **User Login (Future)**: Fired when an actor authenticated to audit security logs.

---

## 15. Assumptions & Constraints

* **Single Warehouse for MVP**: The initial version assumes a single physical location where all stock is received, stored, and sold.
* **Single Store Initially**: Multiple retail fronts are not supported in the immediate phase; inventory is shared across a single register.
* **AI Recommendations are Advisory Only**: Recommendations do not trigger automated orders to suppliers; they require confirmation by an administrator or manager.
* **Authentication Introduced in a Later Phase**: The current frontend mock setup does not enforce strict user authentication; full role separation will be wired during the backend implementation phase.

---

## 16. Non-Functional Considerations

* **Scalability**: The domain model must scale to handle tens of thousands of products and thousands of sales transactions daily.
* **Performance**: Product searches and stock checks must resolve in sub-second times to prevent checkout delays for sales staff.
* **Security**: Business operations must enforce role boundaries (e.g. Sales staff cannot edit prices). Stored customer data and financial transactions must be protected.
* **Reliability**: Inventory calculations must remain consistent and accurate, preventing data corruption during concurrent transactions.
* **Maintainability**: The service and database interfaces must remain clean and decoupled to allow easy backend integration.
* **Auditability**: Complete tracking of every quantity change is mandatory to meet business accounting requirements.

---

## 17. Future Scalability

* **Multiple Warehouses**: Track stock across separate logical and physical warehouses, coordinating inter-warehouse transfers.
* **Barcode & QR Scanning**: Enable quick checkout and replenishment counts via mobile scanner integrations.
* **Supplier Management & Purchase Orders**: Automate procurement by generating draft Purchase Orders directly from AI recommendations.
* **Returns & Claims**: Manage defective product return workflows from customers to suppliers.
* **Dynamic Notifications**: Send real-time SMS, Email, or WhatsApp alerts to managers when critical stockouts occur.
* **Multi-Store Support**: Aggregate metrics from multiple physical locations under a single dashboard.
* **Predictive AI Forecasting**: Anticipate demand shifts based on seasonal trends and external factors.

---

## 18. Business Processes

### Product Registration
* **Trigger**: A new product line is procured or offered by the retailer.
* **Steps**:
  1. The Admin or Inventory Manager opens the registration screen.
  2. Input product name, unique SKU, purchase price, selling price, and category.
  3. Set a minimum stock threshold.
  4. Submit to create the product profile.
* **Outcome**: The product profile is saved in the catalog, assigned a status of `IN STOCK` (if quantity > 0) or `OUT OF STOCK`, and becomes available for sales and monitoring.

### Inventory Replenishment
* **Trigger**: Low stock alert is observed, or a supplier shipment arrives.
* **Steps**:
  1. The Inventory Manager reviews reorder suggestions.
  2. A shipment is ordered and received at the store.
  3. The Inventory Manager inputs the received quantity against the product SKU.
  4. The system adds this quantity to the current stock.
* **Outcome**: Product inventory level increases, low stock status clears (if quantity > threshold), and the replenishment action is logged.

### Sales Processing
* **Trigger**: A customer brings items to checkout.
* **Steps**:
  1. Sales Staff selects products and quantity in the interface.
  2. The system checks if quantity is available.
  3. The system computes the transaction total.
  4. The checkout is completed.
  5. The system deducts the items from inventory and logs the transaction.
* **Outcome**: Customer receives products, inventory counts are reduced immediately, and a sales transaction is logged.

### Stock Adjustment
* **Trigger**: Discrepancies found during physical stock audits, or items are damaged/returned.
* **Steps**:
  1. The Inventory Manager selects the product.
  2. Input the adjustment quantity (positive or negative) and selects a reason (e.g., Damaged, Audited Discrepancy).
  3. The system applies the change to the stock balance.
* **Outcome**: Digital stock matches physical stock, and an audit entry records the change, manager details, and reason.

### Inventory Monitoring
* **Trigger**: Continuous automated monitoring or user opening the Dashboard.
* **Steps**:
  1. The system reviews the quantity of each product.
  2. If quantity falls below the minimum threshold, state updates to `LOW STOCK` or `OUT OF STOCK`.
  3. Urgent actions are created for the dashboard.
* **Outcome**: Dashboard alerts and lists are updated, notifying staff of replenishment needs.

### AI Recommendation Generation
* **Trigger**: Daily analysis run or sudden drop in inventory levels.
* **Steps**:
  1. The system reads stock levels and sales velocity metrics.
  2. Compares levels with threshold settings.
  3. Computes the optimal reorder quantities.
  4. Publishes recommendations to the reports page.
* **Outcome**: Actionable reorder guidelines are presented to the manager to facilitate procurement.

### Report Generation
* **Trigger**: Executive request or scheduled period end (daily, weekly, monthly).
* **Steps**:
  1. The system aggregates all sales transactions and inventory logs.
  2. Calculates total stock value, turnover rate, and individual product velocity stats.
  3. Compiles metrics into a visual dashboard summary.
* **Outcome**: Business health reports are compiled, providing insight into revenue, margins, and stock health.

---

## 19. Business Risks

* **Stockouts**: Prevented by proactive threshold notifications and reorder recommendations.
* **Overstock**: Prevented by visual stock health indicators highlighting overstocked categories.
* **Duplicate SKUs**: Prevented by strict system validation during product creation and update.
* **Incorrect Inventory Counts**: Prevented by mandatory reason logging for adjustments and periodic physical count audit triggers.
* **Unauthorized Inventory Changes**: Prevented by role permissions blocking sales staff from executing manual adjustments or editing prices.
* **Lost Sales**: Prevented by real-time inventory visibility, allowing sales staff to check alternate item availability immediately.
* **Manual Calculation Errors**: Prevented by automated system calculations for totals, margins, and stock balances.

---

## 20. Success Metrics

* **Inventory Accuracy**: Target >99% match rate between physical warehouse audits and digital inventory records.
* **Stockout Reduction**: Decrease out-of-stock events by 80% compared to pre-implementation baselines.
* **Overstock Reduction**: Reduce excess inventory holding costs by 20% through optimal stock level alerts.
* **Faster Inventory Updates**: Instant, real-time balance updates upon sales and shipments, replacing daily batch updates.
* **Reduced Manual Work**: Decrease time spent preparing purchase orders and counting stock by 50%.
* **Improved Sales Reporting**: Immediate access to sales velocity charts and performance metrics.
* **Recommendation Accuracy (Future)**: Over 90% of generated reorder suggestions are approved and executed by managers without modification.

---

## 21. Future Integrations

* **Barcode Scanner**: To instantly identify products during checkout and replenishment counts.
* **QR Code Scanner**: For inventory check-ins and tracking specific product batches.
* **Point of Sale (POS) System**: Synchronize offline register checkouts directly with StockWise inventory.
* **Accounting Software**: Push transaction summaries directly to accounting platforms (e.g. QuickBooks, Xero).
* **Multi-Channel Notifications**: Real-time SMS, Email, and WhatsApp alerts for low stock levels.
* **Supplier Procurement APIs**: Send purchase orders directly to suppliers' systems for automated replenishment.
* **Cloud Storage**: Export CSV/PDF reports and backup transaction histories.
* **AI Prediction Services**: Integrate with external machine learning platforms for advanced predictive market demand analysis.

---

## 22. Audit & Compliance Considerations

To maintain compliance and operational control, the following actions must trigger an unalterable log:
1. **Product Created**: Logs the timestamp, author, and initial details.
2. **Product Updated**: Logs the timestamp, author, changed fields (previous vs. new values).
3. **Product Deleted/Retired**: Logs the timestamp, author, and reason for retirement.
4. **Inventory Adjusted (Manual)**: Logs the timestamp, author, quantity change, reason, and previous/new stock levels.
5. **Sale Completed**: Logs transaction ID, date/time, checkout agent, itemized list, prices, and total revenue.
6. **Price Changed**: Logs the previous purchase/selling price, new prices, author, and timestamp.
7. **AI Recommendation Generated**: Logs the date, product SKU, velocity metrics, suggested reorder size, and status change.

---

## 23. Business Data Ownership

### Product Profile
* **Primary Owner**: Store Owner / Administrator
* **Who can create it**: Administrator, Inventory Manager
* **Who can modify it**: Administrator, Inventory Manager
* **Who can view it**: All actors (Administrator, Inventory Manager, Sales Staff, Store Owner, Future Customer)
* **Retention Policy**: Archive retired product profiles indefinitely. Product details must never be hard-deleted to preserve historical sales records.

### Sale / Transaction Record
* **Primary Owner**: Store Owner / Finance Auditor
* **Who can create it**: Sales Staff, Administrator
* **Who can modify it**: Cannot be edited once completed. Corrections must be handled via separate return transactions.
* **Who can view it**: Administrator, Inventory Manager, Store Owner
* **Retention Policy**: Retain transaction logs for a minimum of 7 years to meet tax and accounting compliance requirements, after which records can be archived to cold storage.

### Inventory / Stock Level
* **Primary Owner**: Inventory Manager
* **Who can create it**: N/A (initialized during Product Creation)
* **Who can modify it**: System (via sales/replenishments), Inventory Manager, Administrator (via manual adjustments)
* **Who can view it**: All actors
* **Retention Policy**: Maintained in real-time. Historic stock balance change logs are archived for 5 years to support auditing.

### Category
* **Primary Owner**: Administrator
* **Who can create it**: Administrator
* **Who can modify it**: Administrator
* **Who can view it**: All actors
* **Retention Policy**: Active indefinitely. Deleted categories must first have all associated products reassigned. Category data is archived upon deletion.

### AI Recommendation
* **Primary Owner**: Inventory Manager
* **Who can create it**: System algorithm
* **Who can modify it**: System (to regenerate), Inventory Manager / Admin (to change status, e.g. Approve/Dismiss)
* **Who can view it**: Administrator, Inventory Manager, Store Owner
* **Retention Policy**: Retained for 12 months for analytics on replenishment accuracy, then deleted or aggregated.

### Audit Records (Adjustment & Price logs)
* **Primary Owner**: Store Owner / Administrator
* **Who can create it**: System (triggered by actions)
* **Who can modify it**: None (immutable log)
* **Who can view it**: Administrator, Store Owner
* **Retention Policy**: Retained indefinitely to meet compliance requirements. Must never be deleted or altered.
