# TallentX - Copilot Instructions

## Project Overview

TallentX (AI Hiring System) is an Angular 21 application for candidate-recruiter matching. It uses standalone components, Tailwind CSS v4, and follows strict design system principles defined in `.specify/memory/constitution.md`.

## Commands

### Development
```bash
npm start              # Start dev server on http://localhost:4200
ng serve               # Alternative dev server command
```

### Build
```bash
npm run build          # Production build (outputs to dist/)
npm run watch          # Development build with watch mode
```

### Testing
```bash
npm test               # Run all tests with Vitest
ng test                # Alternative test command
```

**Running specific tests:**
```bash
npm test -- auth.spec.ts          # Run specific test file
npm test -- --grep "login"        # Run tests matching pattern
```

### Code Generation
```bash
ng generate component component-name    # Generate new component
ng generate service service-name        # Generate new service
ng generate --help                      # See all available schematics
```

## Architecture

### Directory Structure

```
src/app/
├── core/              # Singleton services, guards, interceptors, models
│   ├── guards/        # Route guards (authGuard)
│   ├── interceptors/  # HTTP interceptors (authInterceptor)
│   ├── models/        # TypeScript interfaces (*.models.ts)
│   └── services/      # Business logic services (providedIn: 'root')
├── layout/            # Shell components (navbar, footer) - always visible
├── pages/             # Feature pages - lazy loaded routes
│   ├── landing/
│   ├── login/
│   ├── register/
│   ├── candidate-dashboard/
│   └── profile/
└── shared/            # Reusable components, directives, pipes
    └── components/    # UI components (job-card, toast)
```

### Component Architecture

**All components are standalone** (no NgModules):
- File naming: `component-name.ts` (not `.component.ts`)
- Selector naming: `app-component-name`
- Always set `standalone: true`

**Component types:**
- **Page components** (`pages/`): Full-page views with routing, forms, API calls
- **Feature sub-components** (`pages/*/components/`): Reusable within a specific page
- **Shared components** (`shared/components/`): Reusable across entire app

### Routing Pattern

All routes use **lazy loading** with `loadComponent`:

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () => import('./pages/candidate-dashboard/dashboard.page').then(m => m.DashboardPage)
}
```

- Public routes: landing, login, register (no guards)
- Protected routes: dashboard, profile (use `authGuard`)

### State Management

**No NgRx/Akita** - use the following patterns:

1. **RxJS BehaviorSubject** for service-level state:
```typescript
private profileSubject = new BehaviorSubject<CandidateUIProfile | null>(null);
public profile$ = this.profileSubject.asObservable();
```

2. **Angular Signals** for UI state:
```typescript
isDarkMode = signal(false);
toasts = signal<ToastMessage[]>([]);
```

3. **Component local state** for forms and loading flags

### Dependency Injection

Prefer modern **`inject()`** function over constructor injection:

```typescript
// Preferred (functional style)
private router = inject(Router);
private toast = inject(ToastService);

// Acceptable (traditional style)
constructor(private http: HttpClient) {}
```

### HTTP & API

- All HTTP calls go through **services** in `core/services/`
- `authInterceptor` automatically attaches Bearer tokens
- Services transform API models to UI models (e.g., `CandidateAPIProfile` → `CandidateUIProfile`)
- Always use `catchError()` for error handling with toast notifications

### Forms

Use **Reactive Forms** with `FormBuilder`:
- Import `ReactiveFormsModule`
- Use validators: `Validators.required`, `Validators.email`, etc.
- Call `markAllAsTouched()` before showing validation errors

## Key Conventions

### Constitution Compliance

**CRITICAL**: All code must follow the principles in `.specify/memory/constitution.md`:

1. **Stitch Design System** (NON-NEGOTIABLE):
   - Colors: Primary `#0058be`, Secondary `#4648d4`, Tertiary `#8127cf`
   - Typography: Inter font family
   - **No 1px borders** for sectioning - use background color shifts
   - Border radius: Always `12px` (`rounded-xl` in Tailwind)
   - Shadows: Ghost shadows with `on_surface` at 4-6% opacity

2. **Type Safety** (NON-NEGOTIABLE):
   - Define interfaces in `core/models/*.models.ts`
   - **NO `any` type** (except justified third-party interfaces)
   - Use typed reactive forms

3. **Responsive & Dark Mode**:
   - Mobile-first with Tailwind breakpoints
   - All components support dark mode via `dark:` classes
   - Dark mode toggled via `.dark` class on `<html>`

### Styling with Tailwind

- **Utility-first approach** - no custom CSS unless necessary
- Dark mode pattern: `bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`
- Use `rounded-xl` (12px) for all corners
- Add `transition-colors duration-300` for smooth theme changes

### FontAwesome Icons

Use **HTML class syntax** (not Angular component wrapper):

```html
<i class="fa-solid fa-briefcase"></i>
<i class="fa-spinner fa-spin"></i>
```

### API Response Transformation

Services must map API responses to UI models with computed fields:

```typescript
private mapToUIProfile(apiProfile: CandidateAPIProfile): CandidateUIProfile {
  return {
    ...apiProfile,
    fullName: `${apiProfile.firstName} ${apiProfile.lastName}`,
    completionPercentage: this.calculateCompletion(apiProfile),
    hasResume: !!apiProfile.resumeUrl
  };
}
```

### Error Handling Pattern

```typescript
this.service.someAction().pipe(
  tap(result => this.toastService.success('Success message')),
  catchError(error => {
    this.toastService.error('User-friendly error message');
    return of(null);  // or empty array []
  })
).subscribe();
```

### Loading States

- Use `ngx-spinner` for global loading: `this.spinner.show()` / `this.spinner.hide()`
- Use local flags for component-specific loading: `isLoading = signal(false)`
- Disable buttons during submission to prevent duplicates

### Guards & Interceptors

Use **functional style** (not class-based):

```typescript
// Guard
export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('token');
  return token ? true : inject(Router).parseUrl('/login');
};

// Interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
```

### Environment Configuration

```typescript
import { environment } from '../../../environments/environment';

private base = environment.apiUrl;  // http://ies.runasp.net/api
```

## Prettier Configuration

The project uses Prettier with:
- Print width: 100 characters
- Single quotes: true
- Angular parser for HTML templates

Format code: `npx prettier --write .`

## Testing

- Test runner: **Vitest** (not Karma/Jasmine)
- Test files: `*.spec.ts` alongside source files
- Test services with mocked HTTP: Use `HttpClientTestingModule`
- Test components: Focus on user interactions and state changes

## Important Notes

- **Component selector prefix**: Always `app-`
- **Token storage**: `localStorage.getItem('token')` / `setItem('token', token)`
- **Router navigation**: Use `Router.navigate()` or `routerLink` directive
- **Logout flow**: Clear token + clear profile + navigate to login
- **Angular version**: 21.1.0 (use latest features like signals, functional guards)
- **TypeScript strict mode**: Enabled - all compiler strict flags are on

## Related Documentation

- **Constitution**: `.specify/memory/constitution.md` - Project principles and governance
- **README**: `README.md` - Angular CLI usage and basic commands
- **Tailwind Config**: `tailwind.config.js` - Dark mode and content paths

## Quick Reference

| Task | Command/Pattern |
|------|----------------|
| Start dev server | `npm start` |
| Run tests | `npm test` |
| Build production | `npm run build` |
| Generate component | `ng generate component name` |
| Create service | Add to `core/services/`, use `providedIn: 'root'` |
| Add route | Update `app.routes.ts` with lazy loading |
| API call | Create service method with model transformation |
| Dark mode styling | Add `dark:` prefix to Tailwind classes |
| Show toast | `inject(ToastService).success('message')` |
| Protect route | Add `canActivate: [authGuard]` to route |
