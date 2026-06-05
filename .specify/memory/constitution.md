<!--
===============================================================================
SYNC IMPACT REPORT
===============================================================================
Version Change: N/A → 1.0.0 (Initial ratification)

Added Sections:
- Core Principles (7 principles)
- Technology Stack
- Development Workflow
- Governance

Templates Checked:
- ✅ plan-template.md - Constitution Check section aligned
- ✅ spec-template.md - Requirements and testing approach aligned
- ✅ tasks-template.md - Phase structure and testing philosophy aligned

Follow-up TODOs: None
===============================================================================
-->

# TallentX Constitution

## Core Principles

### I. Design-System Fidelity (NON-NEGOTIABLE)

All UI components and pages MUST adhere to the Stitch design system specifications:

- **Colors**: Use Material Design tokens from Stitch (Primary: `#0058be`, Secondary: `#4648d4`, Tertiary: `#8127cf`)
- **Typography**: Inter font family with defined scale (Display, Headline, Title, Body, Label)
- **No-Line Rule**: 1px solid borders are PROHIBITED for sectioning; use background color shifts and tonal transitions instead
- **Roundness**: All components MUST use 12px (`lg`) corner radius
- **Shadows**: Use ambient "Ghost Shadows" with `on_surface` at 4-6% opacity, 32-64px blur

**Rationale**: Ensures visual consistency and premium UX across the application, matching the approved Stitch designs.

### II. Component-First Architecture

Every UI element MUST be built as a reusable Angular standalone component:

- Components MUST be self-contained with their own template, styles, and logic
- Shared components reside in `src/app/shared/components/`
- Page-specific components reside within their respective page folders
- Components MUST accept inputs for customization and emit outputs for parent communication

**Rationale**: Promotes code reusability, maintainability, and consistent UI patterns across pages.

### III. Service-Driven State Management

Application state MUST be managed through injectable services:

- Services use `BehaviorSubject` for reactive state (e.g., `CandidateService.profile$`)
- API calls MUST go through dedicated services in `src/app/core/services/`
- Services MUST handle error states gracefully with user-friendly messages
- Services MUST NOT directly manipulate DOM or component-specific state

**Rationale**: Centralizes business logic, enables testability, and maintains separation of concerns.

### IV. Type Safety (NON-NEGOTIABLE)

All code MUST be strongly typed:

- Explicit interfaces/types in `src/app/core/models/` for all data structures
- NO use of `any` type except in third-party library interfaces (must be justified)
- API responses MUST have defined TypeScript interfaces
- Form controls MUST use typed reactive forms

**Rationale**: Catches errors at compile time, improves IDE support, and documents data contracts.

### V. Responsive & Accessible Design

All pages and components MUST support:

- **Responsive**: Mobile-first approach using Tailwind breakpoints (`sm`, `md`, `lg`, `xl`)
- **Dark Mode**: Full support via `dark:` Tailwind classes, respecting user preference
- **Accessibility**: Semantic HTML, ARIA labels where needed, keyboard navigation support
- **RTL Support**: Layout MUST work for future Arabic localization

**Rationale**: Ensures the application is usable by all users across devices and preferences.

### VI. Lazy Loading & Performance

Application MUST optimize for performance:

- All route components MUST use lazy loading (`loadComponent`)
- Images MUST use lazy loading and appropriate sizing
- Large lists MUST implement virtual scrolling where applicable
- API calls MUST show loading states and handle timeouts

**Rationale**: Ensures fast initial load times and smooth user experience.

### VII. Security & Authentication

All protected features MUST enforce security:

- Protected routes MUST use `authGuard`
- Tokens MUST be stored securely and attached via `AuthInterceptor`
- Sensitive data MUST NOT be logged or exposed in error messages
- User input MUST be validated on both client and server sides

**Rationale**: Protects user data and prevents unauthorized access.

## Technology Stack

The following technologies are MANDATORY for this project:

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Angular | 21.x | Core application framework |
| Styling | Tailwind CSS | 4.x | Utility-first CSS framework |
| Icons | Font Awesome | 7.x | Iconography |
| State | RxJS | 7.x | Reactive programming |
| Testing | Vitest | 4.x | Unit testing framework |
| Deployment | Vercel | - | Production hosting |
| API | REST | - | Backend communication |

**Constraints**:
- NO additional UI frameworks (no Bootstrap, Material UI, PrimeNG)
- NO state management libraries (no NgRx, Akita) unless complexity demands it
- NO jQuery or direct DOM manipulation

## Development Workflow

### Feature Implementation Process

1. **Design Review**: Verify Stitch design exists for the feature
2. **Specification**: Document user stories and acceptance criteria
3. **Implementation**: Build components following constitution principles
4. **Testing**: Write unit tests for services and critical components
5. **Design Validation**: Compare implementation against Stitch screenshots
6. **Code Review**: Ensure constitution compliance before merge

### Code Organization

```
src/app/
├── core/                    # Singleton services, guards, interceptors, models
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── shared/                  # Reusable components, directives, pipes
│   └── components/
├── layout/                  # App shell components (navbar, footer, sidebar)
├── pages/                   # Feature pages (lazy-loaded)
│   ├── landing/
│   ├── login/
│   ├── register/
│   ├── candidate-dashboard/
│   ├── recruiter-dashboard/
│   └── [feature]/
└── environments/            # Environment configurations
```

### Commit Standards

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`
- Reference Stitch screen IDs in commits when implementing designs
- Keep commits atomic and focused on single changes

## Governance

This constitution supersedes all other development practices for the TallentX project.

### Amendment Process

1. Propose change with rationale in a PR
2. Document impact on existing code
3. Update version following semantic versioning:
   - **MAJOR**: Breaking changes to principles or removal of constraints
   - **MINOR**: New principles added or existing principles expanded
   - **PATCH**: Clarifications, typo fixes, non-functional changes
4. Update all dependent templates if affected

### Compliance Verification

- All PRs MUST verify compliance with Core Principles
- Constitution violations MUST be justified and documented in PR description
- The `Constitution Check` section in `plan-template.md` MUST be completed for all features

### Complexity Justification

Any deviation from simplicity principles MUST be documented with:
- What complexity is being introduced
- Why it's necessary (specific problem being solved)
- What simpler alternative was rejected and why

**Version**: 1.0.0 | **Ratified**: 2026-04-01 | **Last Amended**: 2026-04-01
