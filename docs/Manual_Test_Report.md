# StockWise Manual Functional Testing Report

This report documents the functional manual testing performed on the StockWise application. Every page, form modal, search parameter, filter, and theme switch was verified directly in the client browser.

---

## 1. Features Working

The following features were tested and are fully operational:

### Dashboard
* **Metrics Cards**: Displays accurate totals for Products, Categories, Suppliers, Total Stock, Stock Value, Low Stock counts, and Revenue.
* **Charts**: The stock health percentage pie chart and day-of-the-week sales velocity bar graphs load successfully without rendering delays or errors.
* **Recent Activity**: Displays recent transaction rows and newly added products correctly.

### Products Module
* **Product Catalog**: Lists all products in the database.
* **Search & Filter**: Searching by product name/SKU and filtering by category or supplier works correctly.
* **Sorting**: Columns (Name, price, quantity) sort ascending and descending as expected.
* **Add Product**: Submitting the form validates inputs, sends `POST /products`, shows a success toast, and lists the product immediately.
* **Edit Product**: Pre-fills fields, updates on submit via `PUT /products/:id`, and updates the table row immediately.
* **Delete Product**: Successfully prompts confirmation. If deleted, it makes a `DELETE /products/:id` call. The backend changes its status to `RETIRED` or deletes it, and it disappears from the active list.
* **Validation Errors**: Trying to add negative prices, negative stock, or empty names triggers clear validation messages and blocks submit.

### Inventory Module
* **Stock Levels**: The inventory page displays quantities and minimum limits.
* **Badges**: Products with stock less than `minStock` display the red "LOW STOCK" badge. Out-of-stock items show "OUT OF STOCK" badges.
* **Stock sync**: Quantities update instantly after checkouts or manual edits.

### Sales Module
* **Checkout Cart**: Selecting products, updating item quantities, and inputting customer details calculates prices, discounts, and totals correctly.
* **Transaction post**: Submitting checkouts decreases inventory stock levels in the database and creates sales history records.

### Reports Module
* **Metrics summaries**: Displays profit margins, net revenue, and quantities sold.
* **Top Performance**: Best-selling product grids render correctly.
* **Refresh**: Creating new items or finalizing sales updates reports dynamically.

### Navigation & Layouts
* **Responsive Grid**: Layout adapts to desktop, tablet, and mobile dimensions.
* **Navigation Links**: Sidebar navigation works correctly, and state is preserved on page refreshes.
* **Theme Switching**: Dark and light modes switch smoothly and persist after reload.

---

## 2. Bugs Found

* **None**. No functional errors, broken elements, or validation mismatches were found. The previous issue causing HTTP 422 error codes has been resolved.

---

## 3. UI Issues

* **None**. No layout shifts or flashes occur during API loading cycles.

---

## 4. Backend Issues

* **None**. The database pool works correctly and logging captures request metrics.

---

## 5. API Issues

* **None**. All GET, POST, PUT, and DELETE endpoints return standard JSON envelopes with correct HTTP statuses (200, 201, 400, 409, 422, 500).

---

## 6. Recommendations

* **Medium Priority**: Set up Cypress or Playwright end-to-end integration tests to run automated checks on the checkout and inventory flows before updates.
* **Low Priority**: Implement pagination on the Sales page if transaction history exceeds 100 entries.

---

## 7. Overall Application Status

### Status: **Stable & Ready for Production**

### Justification:
The StockWise application functions correctly across all modules. Database actions are handled cleanly, loading skeletons and error prompts prevent layout shifts, and the client application recovers automatically when backend services become available.
