### Plan to Align EcoDex with the Existing Application Architecture

This plan will refactor the EcoDex feature to integrate it seamlessly into the project's existing **Pages Router** architecture. This approach resolves all identified issues by unifying the routing, styling, and provider logic under a single, consistent pattern.

---

### Step 1: Relocate EcoDex to the Pages Router

The most direct fix is to move the EcoDex feature from the App Router (`src/app`) to the Pages Router (`pages`).

**Action:**
1.  Move the file `src/app/dex/page.tsx` to `pages/dex.tsx`.
2.  Delete the now-unused `src/app/dex/layout.tsx`.
3.  The API routes at `src/app/api/dex/**` can remain as they are compatible with both routers, but for consistency, we could move them to `pages/api/dex/**`. We will leave them for now to minimize scope.

**File move:**
-   **From:** `src/app/dex/page.tsx`
-   **To:** `pages/dex.tsx`

---

### Step 2: Update Component Imports and Hooks

After moving the file, we must adjust imports and hooks to match Pages Router conventions.

**Action:**
-   Modify `pages/dex.tsx` to use `useRouter` from `next/router` instead of `next/navigation`.
-   Update relative paths for component imports.

**File Edit (`pages/dex.tsx`):**
```diff
- import { useRouter, useSearchParams } from 'next/navigation';
+ import { useRouter } from 'next/router';
- import { DexSpecies, EcoDexPayload, Rarity, Element } from '../types/dex';
- import EcoDexHeader from '../components/dex/EcoDexHeader';
- import EcoDexFilters from '../components/dex/EcoDexFilters';
- import EcoDexGrid from '../components/dex/EcoDexGrid';
- import EcoDexDetailSheet from '../components/dex/EcoDexDetailSheet';
+ import { DexSpecies, EcoDexPayload, Rarity, Element } from '../src/types/dex';
+ import EcoDexHeader from '../src/components/dex/EcoDexHeader';
+ import EcoDexFilters from '../src/components/dex/EcoDexFilters';
+ import EcoDexGrid from '../src/components/dex/EcoDexGrid';
+ import EcoDexDetailSheet from '../src/components/dex/EcoDexDetailSheet';

// ... inside the component
export default function EcoDexPage() {
  const router = useRouter();
- const searchParams = useSearchParams();
+ const { query, isReady } = router;

// ... inside useEffect for detail sheet
  useEffect(() => {
-   const speciesId = searchParams.get('species');
+   if (!isReady) return;
+   const speciesId = query.species as string;
    if (speciesId && data) {
// ...
// ... inside openDetailSheet
- router.push(`/dex?species=${species.speciesId}`, { scroll: false });
+ router.push(`/dex?species=${species.speciesId}`, undefined, { shallow: true });

// ... inside closeDetailSheet
- router.push('/dex', { scroll: false });
+ router.push('/dex', undefined, { shallow: true });

}
```

*Note: The path changes from `../types/dex` to `../src/types/dex` because we are moving out of the `src/app` directory.*

---

### Step 3: Restore `globals.css` and Configure Tailwind

The `globals.css` file is missing essential Tailwind directives. We also need to ensure Tailwind is configured to scan the new component paths.

**Action:**
1.  Add the standard Tailwind directives back to the top of `styles/globals.css`.
2.  Create a `tailwind.config.js` file at the project root to explicitly define the `content` paths.

**File Edit (`styles/globals.css`):**
```diff
+ @tailwind base;
+ @tailwind components;
+ @tailwind utilities;
  @import "tailwindcss";
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
```

**New File (`tailwind.config.js`):**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}', // Add src/components path
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
*Note: We add both `components` and `src/components` to be safe, as the project structure is mixed.*

---

### Step 4: Remove Unnecessary App Router Directories

To prevent confusion and future issues, we should clean up the now-empty `src/app` directories related to the page.

**Action:**
-   Delete the `src/app/dex` directory.
-   If `src/app` contains no other pages, consider removing it entirely (except for the API routes which we are keeping for now). For this plan, we'll just remove the page folder.

**Deletion:**
-   `src/app/dex/`

By completing these steps, the EcoDex feature will be fully integrated into the existing Pages Router architecture. It will automatically inherit the `GlobalContext`, `BottomNavigation`, and global styles, ensuring a consistent look, feel, and behavior with the rest of the application.
