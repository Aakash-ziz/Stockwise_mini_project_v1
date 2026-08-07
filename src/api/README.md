# StockWise API Foundation Layer

## Purpose
This folder prepares the abstract networking architecture. It contains interface specifications, typescript types, status code maps, and setup placeholders required for future integration with backend REST endpoints.

## Directory Layout
* `types.ts`: General typescript type declarations.
* `apiClient.ts`: Defines the Client contract interface.
* `endpoints.ts`: Maps target backend URL paths.
* `request.ts`: Contains types for query/path params and retry configuration models.
* `response.ts`: Specifies response formats and pagination properties.
* `errors.ts`: Maps target field errors and status models.
* `statusCodes.ts`: Houses HTTP code lists.
* `headers.ts`: Stores key names of custom request headers.
* `auth.ts`: Interfaces for sessions, JWT tokens, and storage methods.
* `interceptors.ts`: Placeholder method for client interceptors.
* `index.ts`: Central export entry point.

## Rules & Integrity
* **No active HTTP client (Fetch, Axios, etc.) is configured here.**
* **All modules are stateless interfaces and abstract layouts for preparation only.**
