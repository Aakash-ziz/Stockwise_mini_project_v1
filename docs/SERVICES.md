# StockWise Service Layer Architecture

This document describes the design, implementation guidelines, and rules governing the **Service Layer** and **Mock Data Layer** in the StockWise application.

---

## 1. Purpose of the Service Layer

The Service Layer acts as a stateless, business-oriented abstraction barrier between the React User Interface (pages, components, and contexts) and the actual data source (mock datasets, local storage, or remote REST APIs).

* **Decoupling**: React pages never interact directly with networking clients, databases, or mock datasets. They call the Service Layer to initiate business transactions.
* **Flexibility**: Decoupling the UI from data fetching allows developers to swap out the underlying data source (e.g., from mock data to live REST APIs) without editing a single UI component or React page.
* **Testability**: Services are plain, framework-agnostic JavaScript modules that can easily be unit tested using test runners.

---

## 2. Directory Layout & Roles

The architecture divides data responsibilities into two distinct segments:

```text
src/
├── mocks/               # Data-Only Layer
│   ├── delay.ts         # Latency simulator helper
│   ├── products.ts      # Product datasets
│   ├── sales.ts         # Sales history lists
│   ├── reports.ts       # Performance summaries
│   ├── dashboard.ts     # Velocity graphs data
│   ├── inventory.ts     # Aggregated loaders
│   └── index.ts         # Exports combiner
└── services/            # Coordination Layer
    ├── productService.ts # CRUD actions
    ├── salesService.ts   # Log checkouts
    ├── dashboardService.ts # Velocity aggregates
    ├── reportService.ts  # Performance KPIs
    ├── inventoryService.ts # Overall snapshots
    └── index.ts          # Exports combiner
```

---

## 3. Core Layer Responsibilities

### 📄 Pages & Layouts
* **Role**: Presentation and state routing.
* **Rules**: 
  * Pages must **never** import datasets from `src/mocks/*` directly.
  * Pages must **never** import `apiClient` or make `fetch`/`axios` requests.
  * Pages interact only with custom React Context hooks (like `useInventory`) or call services directly.

### 📄 React Context (`useInventory`)
* **Role**: Expose application states (such as active loading/error indicators and global inventory lists) and trigger async mutations.
* **Rules**:
  * Context must **never** import datasets from `src/mocks/*` directly.
  * Context communicates exclusively with the Service Layer.

### 📄 Services (`src/services/`)
* **Role**: Coordinate transactions and orchestrate domain workflows.
* **Rules**:
  * Services must be completely stateless.
  * Services must **never** reference `import.meta.env` or networking libraries directly.
  * Every service operation must return a standard ES6 **Promise** wrapping a `ServiceResponse` and simulate networking latency using the delay helper.

### 📄 Mocks (`src/mocks/`)
* **Role**: Centralized dataset records.
* **Rules**:
  * Mock files must contain **only** static data structures.
  * Mock files must **never** perform business calculations, filters, queries, or validation logic.

---

## 4. Service Interface Conventions

To support interface segregation and modular swappability, every domain service implements an explicit TypeScript contract interface defined in `src/types/inventory.ts`:

* **`IProductService`**: Exposes CRUD endpoints:
  * `getProducts(): Promise<ServiceResponse<Product[]>>`
  * `getProductById(id: string): Promise<ServiceResponse<Product | null>>`
  * `createProduct(product: Omit<Product, 'id' | 'status'>): Promise<ServiceResponse<Product>>`
  * `updateProduct(id: string, updatedFields: Partial<Product>): Promise<ServiceResponse<Product | null>>`
  * `deleteProduct(id: string): Promise<ServiceResponse<boolean>>`
* **`ISalesService`**: Exposes sales tracking endpoints:
  * `getSales(): Promise<ServiceResponse<Transaction[]>>`
  * `createSale(sale: Omit<Transaction, 'id' | 'date' | 'status'>): Promise<ServiceResponse<Transaction>>`
* **`IDashboardService`**: Exposes metrics endpoints:
  * `getDashboardMetrics(): Promise<ServiceResponse<DashboardMetrics>>`
* **`IReportService`**: Exposes summaries endpoints:
  * `getReportSummary(): Promise<ServiceResponse<ReportSummaryPayload>>`
* **`IInventoryService`**: Exposes SNAPSHOT overview endpoints:
  * `getInventoryOverview(): Promise<ServiceResponse<InventoryOverview>>`

---

## 5. Reusable Delay Latency Helper

To prepare the React UI for asynchronous network delays in a production setting, all mock service methods pass their payloads through the `delay` helper:

```typescript
// src/mocks/delay.ts
export const delay = <T>(value: T, ms: number = 200): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
};
```
This forces the React context to load variables asynchronously and manage loading state indicators, simulating the behavior of a live server environment.

---

## 6. Service Request Lifecycle Flows

This section maps out how values travel through the Service Layer during operations:

### A. Request & Response Flow
```text
[Page Component] ➔ triggers state action ➔ [React Context Store]
      ↓
[React Context Store] ➔ calls service interface method (e.g. getProducts())
      ↓
[Domain Service] ➔ queries dataset record mock ➔ resolves delay helper
      ↓
[Service Response Wrapper] ➔ returns standardized shape { success: true, data }
      ↓
[React Context Store] ➔ updates React state ➔ re-renders [Page Component]
```

### B. Error Handling Flow
Services do not handle display logic or throw uncaught crashes. Instead, errors are caught or matched inside the service wrapper and resolved as standard responses:
```text
[Domain Service] ➔ catches validator failure or empty match
      ↓
[Domain Service] ➔ returns failed wrap: { success: false, data: null, error: { code, message } }
      ↓
[React Context Store] ➔ updates context error state OR dispatches a success/error Toast notification
      ↓
[Page Component / Toast] ➔ renders user-facing validation message
```

### C. Loading Indicator Flow
```text
[Page Component] ➔ mounts
      ↓
[React Context Store] ➔ set loading state: true ➔ calls service promise
      ↓
[Service delay()] ➔ waits 200ms latency
      ↓
[React Context Store] ➔ promise resolves ➔ set loading state: false ➔ updates local list
      ↓
[Page Component] ➔ hides spinner / loader skeletons ➔ renders data list
```

---

## 7. Future FastAPI Integration Strategy

When shifting from the offline mock dataset to a live FastAPI backend REST service, the migration process is completely isolated:

```text
React Page/Context ➔ Service Layer ➔ API Client ➔ FastAPI Backend REST Server
```

Because React components and contexts depend strictly on the service interfaces (`IProductService` etc.) rather than concrete models, developers only need to swap the implementation in `src/services/` to read from the prepared `apiClient`:

```typescript
// src/services/productService.ts (Future Connected State Example)
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import type { Product, IProductService, ServiceResponse } from '../types/inventory';

export const productService: IProductService = {
  getProducts: async (): Promise<ServiceResponse<Product[]>> => {
    // Queries remote FastAPI backend instead of mocks
    return apiClient.get<Product[]>(API_ENDPOINTS.products.list);
  },
  
  getProductById: async (id: string): Promise<ServiceResponse<Product | null>> => {
    return apiClient.get<Product>(API_ENDPOINTS.products.detail(id));
  },
  
  createProduct: async (product: Omit<Product, 'id' | 'status'>): Promise<ServiceResponse<Product>> => {
    return apiClient.post<Product>(API_ENDPOINTS.products.create, { body: product });
  },

  // Other operations map similarly...
};
```

No visual layouts, router routes, contexts, hooks, or pages require any code changes.
