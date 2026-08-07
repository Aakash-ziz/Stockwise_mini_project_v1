---
name: StockWise
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-page: 48px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is built on the principles of **Precision Minimalism**. It is designed for inventory management where clarity, speed, and cognitive ease are paramount. The aesthetic draws inspiration from high-end technology brands, prioritizing functional beauty over decorative elements.

The brand personality is **composed, authoritative, and frictionless**. It avoids visual noise to allow the data—stock levels, SKU details, and logistics—to remain the focal point. The UI should evoke a sense of "digital craftsmanship," utilizing ample whitespace, deliberate typography, and a monochromatic palette to convey a premium SaaS experience.

## Colors

The palette is strictly monochromatic to ensure a high-contrast, professional environment. 

- **Primary (#111111):** Used for headlines, primary buttons, and active states. It provides a grounded, heavy anchor for the eye.
- **Secondary (#666666):** Used for body copy and supporting information.
- **Tertiary (#999999):** Reserved for disabled states, breadcrumbs, and placeholder text.
- **Borders (#E5E5E5):** Defined as "Thin Light Gray," these create structure without visual weight.
- **Background (#FFFFFF):** A pure white canvas to maximize the "breathability" of the interface.

Status indicators should use low-saturation functional colors (e.g., muted sage for "In Stock", muted amber for "Low Stock") to maintain the calm atmosphere.

## Typography

This design system utilizes **Inter** exclusively to achieve a systematic, neutral, and highly legible interface. 

- **Page Titles:** Use `headline-lg` with tight letter spacing for a "Linear-inspired" editorial feel.
- **Section Headers:** Use `headline-md` to clearly define content blocks.
- **Body Text:** Standardize on `body-md` for data-heavy views like tables and lists.
- **Actionable Elements:** Buttons and interactive labels use a 500 weight to distinguish them from static body text.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. While the content spans a maximum of 1280px to maintain readability, interior components use fluid percentages or a 12-column grid.

- **Generous Margins:** A minimum of 48px page padding on desktop ensures the "uncluttered" promise.
- **Logical Grouping:** Use `stack-lg` to separate major sections, and `stack-sm` for related input/label pairs.
- **Data Density:** In tables, use 12px vertical padding to balance "cleanliness" with the need to see multiple rows at once.

## Elevation & Depth

To maintain the "Nothing" and "Vercel" aesthetic, elevation is achieved through **Tonal Separation** and **Thin Outlines** rather than heavy shadows.

- **Level 0 (Base):** The #FFFFFF background.
- **Level 1 (Cards/Surface):** Use a 1px border (#E5E5E5) with no shadow.
- **Level 2 (Popovers/Modals):** A 1px border (#E5E5E5) paired with a "Subtle Precision Shadow": `0 4px 12px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)`. 

Do not use gradients. Interaction depth is communicated by subtle background shifts (e.g., from #FFFFFF to #F5F5F5 on hover).

## Shapes

The shape language is refined and consistent. A standard radius of **8px (0.5rem)** is used for small components like inputs and buttons. 

For larger containers, such as dashboard cards and modals, use **12px to 16px** to soften the professional tone. Status badges and tags should use a fully rounded (pill) shape to contrast against the structured grid of the UI.

## Components

### Buttons
- **Primary:** Solid #111111 background, #FFFFFF text. No border. 
- **Secondary:** #FFFFFF background, 1px #E5E5E5 border, #111111 text.
- **Tertiary/Ghost:** No background or border. #666666 text.

### Tables (The Core of StockWise)
- **Header:** #F5F5F5 background, `label-caps` typography, 1px bottom border.
- **Rows:** 1px bottom border (#E5E5E5), #FFFFFF background. Hover state: #F9F9F9.
- **Cells:** Use `body-md` for data; monospaced numbers are preferred for SKU IDs.

### Input Fields
- **Default:** 1px #E5E5E5 border, 8px radius, `body-md` text.
- **Focus:** 1px #111111 border. No "outer glow" or secondary highlight.

### Status Badges
- Small, subtle pill shapes. Use light background tints (e.g., 10% opacity of the functional color) with high-contrast text for accessibility.

### Inventory Cards
- Use 16px padding. Group "Quantity" and "Unit Price" in the top right for immediate scanning. Use 1px #E5E5E5 borders exclusively to define the card boundary.