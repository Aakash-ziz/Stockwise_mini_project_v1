# StockWise Configuration Architecture Documentation

This document describes the design, folder organization, environment variables, naming conventions, and security guidelines of the StockWise configuration and constants subsystems. It serves as a guide for developers joining the project to maintain, extend, and deploy the application across multiple runtime stages.

---

## 1. Purpose

The configuration system in StockWise exists to solve a core problem in enterprise frontends: **decoupling static logic from dynamic environmental properties**.

* **Centralization**: Centralizing environment configurations (like API endpoints and staging flags) ensures that the application doesn't contain hardcoded configurations scattered across components.
* **Separation of Configuration vs. Constants**: 
  * **Configuration** holds values that vary depending on *where* the application is running (e.g., Development, Testing, Production).
  * **Constants** hold values that never change, regardless of the environment (e.g., local storage keys, date formats, UI defaults).
* **Maintainability & Scalability**: Centralizing configuration makes environment switching easy. It enables developers to modify api timeouts or toggle experimental feature flags globally in a single file without modifying component source code.

---

## 2. Project Configuration Structure

Configuration options are managed inside `src/config/`.

| File | Responsibility |
| :--- | :--- |
| `environment.ts` | Declares the core `Environment` interface and exports a static `environment` object representing staging, analytics, and feature flags. |
| `api.ts` | Configures headers, request type parameters, timeouts, and auth storage keys referencing the base environment configurations. |
| `app.ts` | Manages general metadata settings such as application version, timezones, page boundaries, language locales, and base styles. |
| `index.ts` | Serves as the central export entry point, exposing configurations under a single import scope. |

---

## 3. Constants Structure

Constant parameters are managed inside `src/constants/`.

* **`constants.ts`**: Contains general application constants that never change, such as:
  * Default page limits
  * Maximum file size limits
  * Local storage keys (e.g., `theme`, `auth_token`)
  * Notification toast durations
* **`inventory.ts`**: Houses central arrays of choices specific to inventory operations, like product `CATEGORIES` and timelines ranges `TIMELINES`.
* **`index.ts`**: Re-exports all constant models so they can be consumed via `import { CONSTANTS, CATEGORIES } from 'src/constants'`.

---

## 4. Environment Variables

Environmental settings are listed inside `.env.example` in the project root. This file acts as a template for local developers and deployment build pipelines.

| Variable Name | Purpose | Example | Stage-Dependent |
| :--- | :--- | :--- | :---: |
| `VITE_APP_NAME` | The title header of the application. | `StockWise` | No |
| `VITE_APP_VERSION` | SemVer identifier of the current code. | `1.0.0` | No |
| `VITE_APP_ENV` | Current runtime target. | `development` / `staging` / `production` | **Yes** |
| `VITE_API_BASE_URL` | Base endpoint location for network calls. | `http://localhost:5000/api` | **Yes** |
| `VITE_REQUEST_TIMEOUT` | Max delay before aborting network requests (ms). | `30000` | **Yes** |
| `VITE_ENABLE_ANALYTICS` | Boolean toggle for analytics reporting engines. | `false` | **Yes** |
| `VITE_ENABLE_NOTIFICATIONS`| Toggle to broker UI notifications. | `true` | No |
| `VITE_ENABLE_DEBUG` | Enables logger outputs and debugger views. | `true` | **Yes** |
| `VITE_ENABLE_DARK_MODE` | Allows interface theme switching. | `true` | No |
| `VITE_ENABLE_EXPERIMENTAL_FEATURES`| Toggles experimental feature panels in UI. | `false` | **Yes** |

---

## 5. Supported Environments

Future environments supported by the architecture include:

1. **Development (`development`)**:
   * API endpoints point to local servers (e.g., `http://localhost:5000/api`).
   * Verbose debug logging is active.
   * Experimental features are enabled for developer sandboxing.
2. **Testing (`testing`)**:
   * Targeted by automated Cypress or Jest execution scripts.
   * API calls are usually mocked via MSW (Mock Service Worker) wrappers.
3. **Staging (`staging`)**:
   * Mirror of production running on preview infrastructure.
   * Connects to staging databases to allow QA verification of live services.
4. **Production (`production`)**:
   * Connects to highly available live server endpoints (e.g., `https://api.stockwise.com/api`).
   * Debug modules and experimental feature toggles are completely disabled.
   * Analytics and performance monitoring are enabled.

---

## 6. Configuration vs. Constants Comparison

The following table summarizes the conceptual differences between configurations and constants:

| Property | Configuration | Constants |
| :--- | :--- | :--- |
| **Definiton** | Value that changes across environments. | Value that remains identical across environments. |
| **Source** | Loaded dynamically from environment variables. | Hardcoded directly inside constant structures. |
| **Location** | `src/config/` | `src/constants/` |
| **Examples** | API URLs, debug toggles, service timeouts. | Local storage keys, page sizes, date formats. |

---

## 7. Naming Conventions

To keep code clean and readable, developers must follow these naming patterns:

* **Environment Variables**: Must be prefixed with `VITE_` (Vite constraint) and formatted in `UPPER_SNAKE_CASE` (e.g., `VITE_API_BASE_URL`).
* **Constants**: Formatted in `UPPER_SNAKE_CASE` (e.g., `defaultPageSize`, `maxUploadSizeBytes` inside `CONSTANTS` wrapper).
* **Configuration Objects**: camelCase identifiers (e.g., `apiConfig`, `appConfig`).
* **Files**: All lowercase with snake_case or kebab-case separators (e.g., `environment.ts`, `mock-data.ts`).
* **Folders**: All lowercase names indicating the module role (e.g., `config/`, `constants/`, `types/`).

---

## 8. Security Guidelines

> [!CAUTION]
> **Never commit secrets, tokens, API keys, passwords, or credentials into the repository.**

* **No `.env` in Git**: `.env` files contain active keys and must always be ignored in the `.gitignore` file.
* **Commit Example Only**: Only `.env.example` containing dummy values and structure definitions is committed.
* **Production Secret Management**: Staging and production keys must be managed through the CI/CD deployment platform configurations (e.g., Vercel, Netlify, or GitHub Action secrets).

---

## 9. Future Backend Integration Path

Once backend services are available, future milestones will build on top of this structure to:
1. **Consume Env Variables**: Update `environment.ts` to read properties from Vite's loader engine:
   ```typescript
   appName: import.meta.env.VITE_APP_NAME || 'StockWise',
   ```
2. **Initialize API Client**: Construct a central Axios/Fetch client using `apiConfig.baseUrl` and `apiConfig.requestTimeout`.
3. **Configure Authentication**: Bind request interceptors to automatically extract tokens from `localStorage` using the constant `CONSTANTS.localStorageKeys.authToken` and append it to headers.
4. **Error Interceptors**: Add response interceptors to catch API errors (such as 401 Unauthorized or 403 Forbidden) and trigger global Toast notifications.

---

## 10. Best Practices

* **Always Keep Centralized**: Never hardcode endpoint URLs inside components. Import them from config modules.
* **Maintain Type-Safety**: Always declare TypeScript interfaces for any newly added config property.
* **Update Example Templates**: Whenever a new environment variable is introduced, append it to `.env.example`.
* **Sync Documentation**: Document new configurations in this file to guide other team members.

---

## 11. Maintenance Guidelines

* **Adding an Env Variable**:
  1. Append the key definition with comments to `.env.example`.
  2. Update the `Environment` interface in [config/environment.ts](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/src/config/environment.ts).
  3. Bind the property statically to the `environment` configuration.
* **Adding a Constant**:
  1. Find the appropriate subsection in [constants/constants.ts](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/src/constants/constants.ts).
  2. Append the key-value pair under the `CONSTANTS` structure.
* **Deprecating Configuration**:
  1. Mark deprecated fields in interfaces with JSDoc tags `@deprecated`.
  2. Verify no components are referencing the key before removing it.
