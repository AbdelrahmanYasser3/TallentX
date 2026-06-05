# The Design System: Intelligent Employment System (IES)

## 1. Overview & Creative North Star: "The Neural Architect"
This design system moves beyond the "SaaS dashboard" trope to create an environment that feels like a high-performance AI engine. The Creative North Star is **"The Neural Architect"**—a philosophy where data isn't just displayed; it is illuminated. 

We break the traditional grid-template look through **intentional asymmetry** and **tonal depth**. By utilizing high-contrast typography scales and overlapping "glass" surfaces, we create a UI that feels multi-dimensional. We prioritize breathing room over borders, allowing the user's focus to be guided by light and color rather than rigid containment.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep, cosmic navies (`surface`) contrasted against the high-energy pulse of `primary` electric blue and `secondary` AI accents.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. 
*   **Boundary Definition:** Transition between sections using background color shifts (e.g., a `surface-container-low` section sitting on a `surface` background).
*   **Nesting:** Use the tiered surface tokens (`lowest` to `highest`) to create a physical sense of "stacking." Treat the UI like layered sheets of obsidian glass.

### The "Glass & Gradient" Rule
To evoke a futuristic AI feel:
*   **Floating Elements:** Use `surface-bright` or `surface-container-high` with a 12px-20px `backdrop-blur` and 60% opacity to create a Glassmorphism effect.
*   **Signature Textures:** Apply a linear gradient from `primary` (#adc6ff) to `secondary` (#c0c1ff) at a 135-degree angle for hero CTAs and AI-driven insights to give the interface "soul."

| Token | Value | Role |
| :--- | :--- | :--- |
| `surface` | #0b1326 | Base background layer. |
| `surface-container-low` | #131b2e | Primary content area background. |
| `surface-container-high` | #222a3d | Elevated cards or interactive panels. |
| `primary` | #adc6ff | Actionable elements & brand energy. |
| `secondary` | #c0c1ff | AI-powered features & secondary accents. |
| `tertiary` | #4edea3 | Success states & "Match Found" indicators. |

---

## 3. Typography: The Editorial Edge
We use **Inter** not just for legibility, but as a structural element. By utilizing extreme scale—pairing `display-lg` with `label-sm`—we create an authoritative, editorial feel that distinguishes our platform from generic competitors.

*   **Display & Headlines:** Use `display-md` for high-impact data points (e.g., "98% Match"). These should feel like "statements."
*   **Titles:** `title-lg` should be used for card headings, providing clear hierarchy without needing bold dividers.
*   **Body:** Keep `body-md` for all standard reading. Ensure a line-height of 1.5x to maintain the "high-end" airy feel.
*   **Hierarchy Tip:** Use `on-surface-variant` (muted) for supporting text and `on-surface` (bright) for primary information to create depth through contrast rather than size.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too heavy for a modern AI interface. We achieve lift through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-highest` card on a `surface-container-low` background. The subtle 4% shift in lightness creates a natural, sophisticated lift.
*   **Ambient Shadows:** For floating modals, use a "glow" shadow. Instead of black, use a shadow color derived from `surface-tint` at 8% opacity with a 40px blur. This mimics the light emitted from a screen.
*   **The "Ghost Border" Fallback:** If a container absolutely requires a border for accessibility (e.g., input fields), use the `outline-variant` at **20% opacity**. Never use 100% opaque lines.
*   **Glassmorphism:** Apply to navigation bars and sidebars to allow the "neural" background colors to bleed through, softening the edges of the application.

---

## 5. Components: Style Guide

### Buttons & CTAs
*   **Primary:** High-vibrancy `primary` container with a subtle inner glow. 12px (`md`) rounded corners.
*   **Secondary/AI:** A glass-morphic `secondary-container` with a `secondary` 1px ghost border (20% opacity).
*   **States:** On hover, buttons should "bloom"—slightly increasing the glow/shadow spread rather than just changing color.

### Cards & Lists
*   **The "Anti-Divider" Rule:** Forbid the use of divider lines in lists. Separate items using `8px` of vertical white space (Spacing `2`) or by alternating between `surface-container-low` and `surface-container-lowest`.
*   **Match Cards:** Use a gradient "edge-light" (a 2px left border using the `tertiary` success color) to indicate high-quality AI matches.

### Input Fields
*   **Styling:** Use `surface-container-highest` with no border. On focus, transition to a 1px `primary` ghost border and a soft `primary` outer glow.
*   **Feedback:** Error states use `error` text, but the field background should shift to `error-container` at 10% opacity.

### AI-Specific Components
*   **Neural Pulse:** A small, animated pulse icon using `secondary` to indicate the AI is "thinking" or processing data.
*   **Match-Score Gauge:** Use a semi-circular stroke with a `primary` to `tertiary` gradient to show candidate viability.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts to lead the eye toward key AI insights.
*   **Do** leverage the `Spacing Scale` (specifically `8`, `12`, and `16`) to create generous white space between functional blocks.
*   **Do** use `backdrop-blur` (16px+) for any element that sits "above" the main content.

### Don’t:
*   **Don’t** use pure black (#000000). Always use the `surface` tokens for a rich, deep navy feel.
*   **Don’t** use standard 1px borders. Use background color shifts instead.
*   **Don’t** crowd the interface. If an element doesn't serve the "Neural Architect" vision, remove it or hide it behind a progressive disclosure pattern.
*   **Don’t** use high-opacity shadows. Keep them "ambient" and tinted to the brand colors.