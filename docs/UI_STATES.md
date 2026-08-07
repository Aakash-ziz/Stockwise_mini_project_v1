# StockWise Standardized UI Feedback States

This document describes the design, implementation patterns, lifecycle, and integration guidelines for standard UI feedback states (Loading, Empty, Error, Success, Retry, Validation, and Notifications) in the StockWise application.

---

## 1. Interaction Lifecycles

Every data-driven page or interface panel in StockWise conforms to a unified state transition machine:

```text
       [ Idle / Uninitialized ]
                  │
                  ▼
         [ Loading State ] ➔ (Renders PageSkeleton / Spinner)
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
[ Success State ]     [ Error State ] ➔ (Renders ErrorState + Retry)
       │
       ▼
 [ Empty check ] ➔ (If 0 elements, renders EmptyState variant)
```

---

## 2. Directory Layout & Module Roles

```text
src/
├── types/
│   └── ui.ts               # Reusable typings (AsyncState, LoadingVariant)
├── constants/
│   └── feedback.ts         # Central config, titles, and text copies
├── hooks/
│   └── useAsyncState.ts    # Reusable async handler hook
├── utils/
│   ├── errorFormatter.ts   # Parses HTTP codes (401, 403, 404, 500, etc.)
│   ├── validationMessages.ts # Unified form inputs alerts
│   └── toastMessages.ts    # Central actions completion warnings
└── components/
    └── feedback/
        ├── LoadingState.tsx # Multiple spinner and button variants
        ├── EmptyState.tsx   # Pre-configured empty prompts
        ├── ErrorState.tsx   # Screen reader accessible error block
        ├── SuccessState.tsx # Save/Update notifications panel
        ├── RetryState.tsx   # Generic callbacks link
        └── PageSkeleton.tsx # Layout wireframes for grids & tables
```

---

## 3. Feedback Component Catalog

### 🔄 A. LoadingState
Supports multiple configurations via the `variant` parameter:
* `page`: Centered circular page load spinner.
* `card`: Skeleton loader block for widgets.
* `table`: Loading row layout.
* `spinner`: Small inline status spinner.
* `button`: Small white spinner inside interactive buttons.

### 📭 B. EmptyState
Renders standard visual layouts and descriptions mapped to specific domain segments:
* `products`: "No Products Registered."
* `sales`: "No Transaction Logs Found."
* `reports`: "No Analytics Ready."
* `search`: "No Matching Results."
* `notifications`: "No Alerts Active."
* `generic`: "No Data Available."

### ⚠️ C. ErrorState
Implements standard accessibility-friendly alerting:
* Integrates `role="alert"` and `aria-live="assertive"`.
* Supports retry action bindings out of the box.

---

## 4. Reusable Custom Async Hook (`useAsyncState`)

Pages or components fetching custom datasets can standardize lifecycle variables by invoking `useAsyncState`:

```typescript
import { useAsyncState } from '../hooks/useAsyncState';
import { productService } from '../services/productService';

export const ProductList = () => {
  const { loading, error, success, data, execute, retry } = useAsyncState(
    productService.getProducts
  );

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <PageSkeleton variant="table" />;
  if (error) return <ErrorState title="Load Failed" message={error} onRetry={retry} />;
  if (!data || data.length === 0) return <EmptyState variant="products" />;

  return (
    // Render list...
  );
};
```

---

## 5. Centralized Messages & Copy Constants

To avoid hardcoded labels inside UI views, every alert message is declared in centralized utility assets:

### Form Inputs validation (`VALIDATION_MESSAGES`)
* Mapped inside `src/utils/validationMessages.ts`.
* Example: `VALIDATION_MESSAGES.invalidQuantity` ("Quantity must be a positive whole number.").

### Notifications alerts (`TOAST_MESSAGES`)
* Mapped inside `src/utils/toastMessages.ts`.
* Example: `TOAST_MESSAGES.product.deleted("MacBook")` ("Product 'MacBook' was deleted from inventory.").

---

## 6. Error Formatting Strategy

`formatBackendError` resolves HTTP error codes and timeout thresholds into clean titles and body copies, ensuring unified display for future backend APIs:

| Error Case / Code | UI Title | Display Message |
|---|---|---|
| `401` | Session Expired | Your session has expired. Please sign in again. |
| `403` | Access Denied | You do not have administrative clearance to access this action. |
| `404` | Resource Not Found | The requested catalog item or path does not exist. |
| `422` | Validation Failed | The input details provided are invalid. Please check fields warnings. |
| `500` | An Error Occurred | Internal server error occurred. Our team is resolving it. |
| `Offline` | You Are Offline | Please check your internet settings and try again. |

---

## 7. Accessibility Guidelines (A11y)

Every feedback component respects accessibility norms:
1. **Screen Readers**: Skeletons use `role="status"` and `aria-live="polite"` so screen readers announce loading transitions.
2. **Alerts announcements**: Errors use `role="alert"` and `aria-live="assertive"` to grab quick reader focus.
3. **Contrast and Styling**: Accent labels are theme-aware, utilizing semantic neutral shades that support high contrast requirements under light and dark themes.
