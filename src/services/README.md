# StockWise Domain Services Layer

## Purpose
The services folder contains domain-specific request execution modules that wrap around `apiClient`. Services act as the bridge between React pages/hooks and the networking infrastructure, keeping presentation code strictly separated from communication details.

## Naming Conventions
* **Files**: camelCase naming (e.g., `productService.ts`, `salesService.ts`).
* **Instances**: Exported as singletons or stateless service classes.

## Examples of Future Services
1. **`productService`**: Orchestrates catalog tasks (`list`, `create`, `update`, `delete`, `search`).
2. **`salesService`**: Conducts register checkouts and pulls transactional logs.
3. **`reportService`**: Requests summaries, top-selling velocities, and performance statistics.
4. **`authService`**: Manages login/logout queries and credential checkups.
5. **`notificationService`**: Fetches read statuses and handles notification center marks.
6. **`inventoryService`**: Coordinates stock levels and warehouse updates.

## Current State
This folder remains empty until backend integration commences (Milestone 5).
