# Design System Strategy: Intelligent Employment System (IES)

## 1. Overview & Creative North Star
The North Star for this design system is **"The Kinetic Architect."** 

In the landscape of Intelligent Employment Systems, we move beyond static data management into a realm of proactive, AI-driven evolution. The interface must feel like a living blueprint—structured and authoritative, yet fluid and innovative. We achieve this by breaking the "template" look. Instead of predictable, centered grids, we utilize intentional asymmetry, significant typographic scale shifts, and depth-based layering that suggests the UI is a series of intelligent, stacked modules rather than a flat page.

The vibe is unapologetically tech-savvy, using high-contrast "Electric Blue" and "Indigo" accents to highlight the AI’s influence, while the core remains sophisticated and editorial.

## 2. Colors & Surface Philosophy
The palette is built on a foundation of deep, midnight tones contrasted against vibrant, electrified accents.

*   **Primary (Electric Blue):** `primary: #85adff` (derived from #3B82F6) serves as the beacon of action. 
*   **Secondary/AI Accent:** A gradient transition from `secondary: #9093ff` to `tertiary: #c180ff`. This "Indigo Pulse" should be reserved for AI-generated insights, matching algorithms, or intelligent suggestions.
*   **Surface Foundation:** The `background: #020a2f` acts as the canvas.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through:
1.  **Tonal Shifts:** Place a `surface_container_low` card on a `surface` background.
2.  **Negative Space:** Use the Spacing Scale (specifically `12` or `16` tokens) to create logical separation.

### The "Glass & Gradient" Rule
To elevate CTAs and hero elements, use subtle linear gradients (e.g., `primary` to `primary_container`) rather than flat fills. For floating navigation or modal overlays, apply **Glassmorphism**: use `surface_container_highest` at 60% opacity with a `24px` backdrop blur.

## 3. Typography: Editorial Authority
We use **Inter** as our single source of truth, but we manipulate scale and weight to create an editorial feel.

*   **Display Scales (`display-lg` to `display-sm`):** Use these for high-impact stats or hero headlines. They should feel massive and confident.
*   **Headlines & Titles:** Use `headline-md` for section headers to provide immediate hierarchy. 
*   **Body & Labels:** `body-md` is our workhorse. Ensure `line-height` is generous to maintain readability in data-heavy employment contexts.

The hierarchy communicates brand identity by treating information like a premium digital magazine: large, bold insights supported by clean, legible metadata.

## 4. Elevation & Depth: Tonal Layering
Forget drop shadows that look like "fuzz." Our depth is architectural.

*   **The Layering Principle:** Stacking determines importance.
    *   *Base:* `surface`
    *   *Section:* `surface_container_low`
    *   *Card/Module:* `surface_container` or `surface_container_high`
*   **Ambient Shadows:** When a floating state is required (e.g., a "New Project" button), use a shadow with a blur of `32px` at `6%` opacity, tinted with the `on_surface` color.
*   **The Ghost Border Fallback:** If a container requires further definition on a complex background, use a "Ghost Border": the `outline_variant` token at **15% opacity**. Never use 100% opaque lines.

## 5. Components
All components feature a **12px (`lg`) rounded corner** as the standard for a soft, tech-savvy feel.

*   **Buttons**: 
    *   *Primary:* `primary_container` fill with `on_primary_container` text. 
    *   *AI Action:* The Indigo/Purple gradient with a subtle `primary` glow on hover.
*   **Navigation (The Hamburger)**: As seen in the TallentX reference, the hamburger menu is contained within a soft-circular button (`full` roundedness). Upon clicking, the dropdown should transition from the top-left using `surface_container_highest` glassmorphism.
*   **Input Fields**: Forgo the traditional box. Use a `surface_container_low` fill with a bottom-only "Ghost Border" that expands to a full `primary` stroke only on focus.
*   **Cards & Lists**: Strictly forbid divider lines. Use `8` (2rem) of vertical spacing between list items. Use background shifts (`surface_container_lowest`) to highlight "hover" states in a list.
*   **AI Insights Component (Custom)**: A specialized container using a `tertiary_container` border (at 20% opacity) and a subtle animated gradient mesh background to signify "Live Thinking."

## 6. Do’s and Don’ts

### Do:
*   **Use the TallentX Logo:** The logo (incorporating the serif 'TallentX' and 'Smart Hiring' subtext) should be placed in the top-left or centered hero position, ensuring the white variant is used on dark `surface` backgrounds.
*   **Embrace Asymmetry:** Align high-level stats to the left while keeping supporting descriptions right-aligned to break the "web template" feel.
*   **Utilize Backdrop Blurs:** Use blurs on navigation headers to let background content peak through, creating a sense of continuity.

### Don’t:
*   **Don't use 1px solid borders:** This is the quickest way to make a high-end system feel "cheap" and "out-of-the-box."
*   **Don't use pure black (#000000):** Use `surface` or `surface_container_lowest` to maintain tonal depth and reduce eye strain.
*   **Don't crowd the UI:** If a layout feels cramped, increase the spacing token by one level (e.g., move from `8` to `10`). Space is a luxury; use it.
*   **Don't ignore the Gradient:** AI-related features *must* use the secondary Indigo/Purple gradient to distinguish them from standard system functions.