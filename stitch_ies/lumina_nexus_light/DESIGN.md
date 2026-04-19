# Design System Specification: The Intelligent Employment System (IES)

## 1. Overview & Creative North Star: "The Cognitive Canvas"
This design system moves away from the rigid, boxy constraints of traditional enterprise software. Our Creative North Star is **The Cognitive Canvas**—an editorial-inspired digital environment that feels breathable, intelligent, and authoritative. 

Instead of overwhelming the user with "data containers," we use **intentional asymmetry** and **tonal depth** to guide the eye. We break the "template" look by favoring white space over borders and using high-contrast typography scales to create a clear information hierarchy. This is not just a tool; it is a premium workspace for high-stakes decision-making.

---

## 2. Color Palette & Tonal Logic

The palette is anchored in a high-contrast professional blue, supported by sophisticated neutrals and AI-driven gradients.

### Core Brand Tokens
*   **Primary (`#0058be`):** Our "Electric Blue" evolved for professional legibility. Use for primary actions and brand presence.
*   **Secondary (`#4648d4`):** A deep Indigo used for secondary interactive elements.
*   **Tertiary/AI Accent (`#8127cf`):** Representing "Intelligence." Used exclusively for AI-driven insights and automated features.
*   **Success (`#10B981`):** Emerald Green for positive status indicators.
*   **Background (`#f7f9fb`):** A very light slate gray that provides a softer foundation than pure white.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established through:
1.  **Background Color Shifts:** Placing a `surface-container-low` element against a `surface` background.
2.  **Vertical Rhythm:** Using the Spacing Scale (specifically `8` to `16`) to create distinct content groups.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to define importance:
*   **Surface (Base):** `#f7f9fb` — The primary canvas.
*   **Surface Container Low:** `#f2f4f6` — For large secondary content areas.
*   **Surface Container Highest:** `#e0e3e5` — For small, high-emphasis UI elements (e.g., active tabs).
*   **Surface Container Lowest:** `#ffffff` — Reserved for "Elevated Cards" to create a crisp, high-contrast focus area.

### The "Glass & Gradient" Rule
To signify AI interaction, use a linear gradient from `Secondary` to `Tertiary`. For floating modals or navigation rails, apply **Glassmorphism**: 
*   **Background:** `surface-container-lowest` at 80% opacity.
*   **Effect:** `backdrop-filter: blur(20px)`.

---

## 3. Typography: Editorial Authority

We use **Inter** exclusively. The power of this system lies in the dramatic scale difference between "Display" and "Body" styles.

*   **Display (sm/md/lg):** 2.25rem to 3.5rem. Use for hero numbers (e.g., "Total Candidates") and high-level section headers. Tighten letter-spacing by -2%.
*   **Headline (sm/md/lg):** 1.5rem to 2rem. Used for dashboard titles. These should feel like news headlines—bold and inescapable.
*   **Body (md/lg):** 0.875rem to 1rem. Use `on-surface-variant` (`#424754`) for body text to reduce eye strain while maintaining high contrast.
*   **Labels (sm/md):** 0.6875rem to 0.75rem. All-caps with +5% letter-spacing for data labels and metadata.

---

## 4. Elevation & Depth: Tonal Layering

We avoid traditional "material" shadows in favor of **Ambient Lift**.

*   **The Layering Principle:** Rather than adding a shadow to a card, place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f2f4f6) background. This creates a natural, "built-in" lift.
*   **Ambient Shadows:** For floating menus, use a 3-layer shadow:
    *   `0 4px 6px -1px rgba(0, 0, 0, 0.04)`
    *   `0 10px 15px -3px rgba(0, 0, 0, 0.03)`
    *   `Shadow Color:` Use a tinted version of `on-surface` (e.g., deep blue-gray) instead of neutral black.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., in a high-density data table), use `outline-variant` at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components & Primitives

### Buttons
*   **Primary:** Solid `primary` (`#0058be`) with `on-primary` (`#ffffff`) text. 12px (`lg`) corner radius.
*   **AI Action:** Gradient background (`secondary` to `tertiary`) with a subtle white inner glow.
*   **Tertiary:** No background. Use `primary` text. Transition to `surface-container-low` on hover.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Strategy:** Use a `1.5rem` (6) gap between list items. For complex cards, use a `surface-container-low` header section that transitions into a `surface-container-lowest` body.

### Input Fields
*   **State:** Background should be `surface-container-lowest` (`#ffffff`).
*   **Focus:** A 2px "Ghost Border" of `primary` at 40% opacity, rather than a hard solid line.
*   **Roundness:** Always use `0.75rem` (md) for inputs to maintain the "Soft Professional" vibe.

### Signature Component: The Intelligence Rail
A vertical navigation or info-bar that uses **Glassmorphism**. It should sit 16px away from the screen edge, appearing to float over the content, utilizing the `xl` (`1.5rem`) corner radius.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. A 3-column grid where one column is significantly wider feels more premium than three equal blocks.
*   **Do** use "Surface Tints." If a section is "Success" related, use a 5% opacity Emerald Green background rather than a green border.
*   **Do** lean into white space. If a page feels "empty," increase the typography size rather than adding more boxes.

### Don’t
*   **Don’t** use 1px solid black or gray borders. This is the fastest way to make the IES look like a legacy system.
*   **Don’t** use pure black (#000000) for text. Use `on-surface` (#191c1e) for better visual comfort.
*   **Don’t** crowd the AI accents. Purple/Indigo gradients are powerful; use them only for features that involve machine learning or automated "magic."