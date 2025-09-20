### EcoDex Alignment Smoke Checklist

Use this checklist to verify that the EcoDex feature is correctly integrated after applying the alignment plan.

---

#### **✅ Rendering & Styling**

-   [ ] **Navigate to `/dex`:** The page loads without errors.
-   [ ] **Check Global Styles:** The page background, fonts, and base styles match the rest of the application (e.g., the home page or camera page).
-   [ ] **Verify Tailwind Application:** All Tailwind utility classes are applied correctly.
    -   Header has a sticky position and glassy background.
    -   Grid layout uses Tailwind's responsive grid classes (`sm:`, `xl:`).
    -   Cards have correct padding, shadows, and hover effects (`hover:translate-y-[-2px]`).
    -   Buttons and filters display the correct colors and gradient styles.
-   [ ] **Check for CSS Warnings:** Open the browser's developer console. There should be no 404 errors for stylesheets or warnings related to CSS parsing.

---

#### **✅ Layout & Providers**

-   [ ] **Bottom Navigation is Present:** The main `BottomNavigation` component is visible and functional at the bottom of the `/dex` page.
-   [ ] **`GlobalContext` is Active:** Any state or functions provided by `GlobalContext` are available to the EcoDex components (if applicable). Check the React Developer Tools to confirm `EcoDexPage` is a child of `GlobalContext`.
-   [ ] **No Layout Shifts or Overlaps:** The page content respects the `pb-safe` padding and does not overlap with the `BottomNavigation` component.

---

#### **✅ Functionality**

-   [ ] **Component Interactivity:**
    -   The search bar is functional.
    -   Filter buttons (Tabs, Rarity, Element, Ownership) work as expected.
    -   Clicking on a species card opens the detail sheet.
-   [ ] **Routing:**
    -   Opening the detail sheet updates the URL with `?species=...` without a full page reload (`shallow: true`).
    -   Closing the detail sheet removes the query parameter from the URL.
-   [ ] **No Console Errors:** The developer console is free of React errors or other runtime exceptions related to the EcoDex components.
