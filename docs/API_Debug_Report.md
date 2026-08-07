# StockWise API Connection Debug Report

This report documents the root cause, files inspected, and fixes applied to resolve the frontend-to-backend communication failure in the StockWise project.

---

## 1. Executive Summary

A communication error (`net::ERR_CONNECTION_REFUSED`) prevented the React frontend from retrieving data from the Node.js backend. 

The investigation revealed two main issues:
1. **The Backend Server was not running**: No process was listening on the configured API port `5000`.
2. **ES Modules Loader Error**: The `ts-node-dev` package crashed on startup because it could not resolve TS files imported with `.js` extensions under ES Module (`"type": "module"`) configuration rules.

Both issues have been resolved. The backend development script was updated to support native ESM compilation, and the backend server is now running successfully on port `5000`. The frontend is communicating with the backend APIs, and all dashboards, inventories, sales history, and reports load dynamic data.

---

## 2. Root Cause

1. **Inactive Server process**:
   * Stethoscope checks showed no active process listening on port `5000`. The browser was attempting to send HTTP queries to an inactive server.
2. **ES Module Resolution Mismatch**:
   * When trying to start the development server via the original `ts-node-dev` script, Node.js crashed. Since the project uses `"type": "module"` in `package.json`, imports require `.js` specifiers. However, `ts-node-dev` is unable to resolve these specifiers dynamically to `.ts` source files without an ESM loader configured, throwing `Must use import to load ES Module`.

---

## 3. Files Inspected

* **[server/package.json](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/server/package.json)**: Scripts and dependency declarations.
* **[server/tsconfig.json](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/server/tsconfig.json)**: TypeScript engine module options.
* **[src/api/apiClient.ts](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/src/api/apiClient.ts)**: Frontend URL concatenation logic and fetch configurations.
* **[server/src/server.ts](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/server/src/server.ts)**: HTTP bootstrap listeners and port parameters.

---

## 4. Problems Found

| File | Location | Cause | Severity |
| :--- | :--- | :--- | :--- |
| **server/package.json** | Line 8 (dev script) | `ts-node-dev` crashed due to missing specifier resolution for `.js` imports in ES module files. | **High** (Blocking startup) |
| **server/tsconfig.json** | End of file | Missing `ts-node` engine parameters to support loaders in development environments. | **High** |
| **src/api/apiClient.ts** | Line 59 | URL concatenation did not handle potential trailing/leading slash duplicates safely. | **Low** |

---

## 5. Fixes Applied

### 1. Reconfigured TypeScript Loader settings
Added the `ts-node` ESM loader configurations in **[server/tsconfig.json](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/server/tsconfig.json)** to handle ESM modules specifier paths:
```json
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
```

### 2. Standardized Development Server Scripts
Modified the `"dev"` script in **[server/package.json](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/server/package.json)** to compile and execute compiled JS for native ESM compatibility:
```json
"dev": "tsc && node dist/server.js"
```
*Note: This utilizes Node's native ESM engine which compiles TS files via `tsc` first, ensuring zero loader resolution mismatches.*

### 3. Slashes Normalization in API Client
Modified **[src/api/apiClient.ts](file:///e:/Aakash%20Coding%20Space/Mini%20Project%20College/Stockwise/src/api/apiClient.ts)** to cleanly trim trailing slashes from the base URL and ensure path variables have exactly one leading slash before parsing.

### 4. Restarted Backend Server Process
Started the server in the background. It is currently listening on port `5000` (`🚀 Server running in development mode on port 5000`).

---

## 6. Verification

* **Backend Startup**: The backend is running and listening on port `5000`.
* **Database Pool Verification**: The server logs confirm the Prisma pool is active and processing requests.
* **REST APIs Success**:
  * `GET /api/v1/products?limit=1000` ➔ Status 200 OK (resolves and flattens database entries).
  * `GET /api/v1/sales?limit=1000` ➔ Status 200 OK.
  * `GET /api/v1/reports/summary` ➔ Status 200 OK (financial summary data).
  * `GET /api/v1/reports/performance` ➔ Status 200 OK.
* **Frontend UI Dashboard**: Skeletons load and disappear correctly, displaying database counts and charts with no connection errors in the browser console.
* **Build & Lint Compliance**:
  * Frontend compilation (`npm run build`) completed successfully with **zero errors**.
  * Backend compilation (`npm run build`) completed successfully with **zero errors**.
  * Both frontend and backend lint checks completed with **zero errors**.

---

## 7. Final Verdict

### Verdict: **Successfully Resolved**

### Justification:
The connection failures are resolved. The backend dev script compiles the server and runs it, and the frontend maps and displays the backend REST APIs. The StockWise application is fully functional.
