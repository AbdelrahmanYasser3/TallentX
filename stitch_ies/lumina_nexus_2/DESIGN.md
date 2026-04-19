# Design System Strategy: The Intelligent Interface

## 1. Overview & Creative North Star
**Creative North Star: "The Cognitive Architect"**

The design system is built to transcend the "standard dashboard" aesthetic. Instead of a rigid grid of boxes, it adopts the persona of an intelligent partner. We move beyond "Modern" into **High-End Editorial Tech**—a style characterized by breathing room, intentional asymmetry, and depth.

The goal is to make the "Intelligent Employment System" feel like a premium concierge. We achieve this by breaking the "template" look: headers may overlap containers, and content flows through a hierarchy of light and shadow rather than lines and borders. It is a system of **Fluid Precision**.

---

## 2. Colors & Surface Architecture
The palette is rooted in a deep, sophisticated Blue-to-Indigo spectrum, punctuated by an AI-driven gradient that signals "intelligence" wherever it appears.

### The Palette
*   **Primary (`#0058be`):** The "Electric" core. Use for high-action states and brand presence.
*   **Secondary/Tertiary (`#4648d4` to `#8127cf`):** The "Cognitive" accents. These tones bridge the gap between human input and machine intelligence.
*   **The AI Gradient:** A signature transition from `Secondary` to `Tertiary`. Reserve this for AI-generated insights, sparkle icons (✨), and "Magic" action buttons.

### The "No-Line" Rule
To maintain a high-end feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through:
1.  **Background Color Shifts:** Placing a `surface_container_low` card on a `surface` background.
2.  **Tonal Transitions:** Using subtle shifts in the Slate Gray scale to define functional zones.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the Material surface tiers to create "nested" depth:
*   **Layer 0 (Base):** `surface` (#f7f9fb) – The canvas.
*   **Layer 1 (Large Sections):** `surface_container_low` (#f2f4f6) – For sidebar backgrounds or secondary content zones.
*   **Layer 2 (Cards/Content):** `surface_container_lowest` (#ffffff) – The primary focus area, creating a "lifted" feel against the base.
*   **Layer 3 (Modals/Popovers):** `surface_bright` (#f7f9fb) – Maximum elevation.

### The "Glass & Gradient" Rule
For floating elements (like an AI Chatbot bubble or a quick-action menu), use **Glassmorphism**: 
*   **Background:** `surface_variant` at 70% opacity.
*   **Effect:** `backdrop-blur` (16px to 24px).
*   **Soul:** Main CTAs should use a subtle vertical gradient from `primary` to `primary_container` to avoid a flat, "Bootstrap" look.

---

## 3. Typography: Editorial Authority
We use **Inter** as a variable font to create a high-contrast hierarchy that feels like a tech-focused magazine.

*   **Display (Large Scale):** Use `display-lg` (3.5rem) and `display-md` (2.75rem) with `-0.02em` letter spacing. These are for "Hero" moments—like a user's name or a major data point.
*   **Headlines & Titles:** `headline-lg` (2rem) and `title-lg` (1.375rem) provide the structural skeleton. Use Semi-Bold (600) for titles to ensure they anchor the page.
*   **Body & Labels:** `body-lg` (1rem) for general reading; `label-md` (0.75rem) in ALL CAPS with `+0.05em` tracking for meta-data and small tags.

The typography is the UI. By increasing the scale of headings and providing generous leading (line-height), the interface becomes readable and authoritative without needing extra decorative elements.

---

## 4. Elevation & Depth
In this system, depth is a functional tool, not a decoration.

*   **The Layering Principle:** Avoid shadows where background shifts work better. A `surface_container_lowest` card on a `surface_container_low` background creates a soft, natural lift.
*   **Ambient Shadows:** For floating components (Modals/Dropdowns), use "Ghost Shadows":
    *   **Color:** `on_surface` (#191c1e) at 4-6% opacity.
    *   **Blur:** 32px to 64px.
    *   **Spread:** -4px (to keep the shadow tucked and clean).
*   **The "Ghost Border" Fallback:** If accessibility requires a border (e.g., in high-contrast mode), use `outline_variant` at **15% opacity**. Never 100%.
*   **Glassmorphism:** Use semi-transparent `surface_container` tokens with a blur to allow the background's "Slate" tones to bleed through, making the UI feel integrated into the environment.

---

## 5. Components

### Buttons
*   **Primary:** `primary` background, `on_primary` text. Use the `xl` (1.5rem) or `lg` (1rem) corner radius.
*   **AI Action:** Secondary-to-Tertiary Gradient. Use when the action triggers an automated or "smart" process.
*   **Transitions:** All hover states must use a `200ms ease-out` curve. Primary buttons should "lift" slightly (scale 1.02) on hover.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Separation:** Use `spacing-8` (2rem) of vertical white space to separate list items, or alternate background colors between `surface_container_lowest` and `surface_container_low`.
*   **Radius:** Always use `lg` (1rem / 12px) for cards to maintain the "Soft Tech" vibe.

### Input Fields
*   **Style:** Minimalist. No bottom line, no full border.
*   **Structure:** Use a `surface_container_highest` background with a subtle `outline_variant` (20% opacity).
*   **Focus State:** A 2px glow of `primary` using an `outer-shadow` rather than a standard border change.

### The "Sparkle" Insight Chip
A custom component for IES. A small chip using `secondary_container` background with a `tertiary` Sparkle (✨) icon. Use this to highlight AI-recommended job matches or resume improvements.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a left-aligned headline that hangs over a right-aligned card).
*   **Do** use the full spacing scale (up to `spacing-24`) to give high-priority data room to breathe.
*   **Do** use `Emerald Green` (#10B981) for success states, but keep it restrained—a small dot or a text color shift is often enough.

### Don't:
*   **Don’t** use pure black (#000000) for text. Use `on_surface` (#191c1e) for better readability on slate backgrounds.
*   **Don’t** use 1px dividers to separate content. Use whitespace or tonal shifts.
*   **Don’t** use the AI Gradient for mundane tasks like "Save" or "Cancel." Keep it sacred for "Intelligent" features.
*   **Don't** use sharp corners. Everything must feel approachable via the 12px (`lg`) roundedness standard.