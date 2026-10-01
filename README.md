# CRM Employee Management Dashboard

A production-style Angular CRM / Employee Management Dashboard built with
**standalone components, Signals, functional guards/interceptors, Reactive
Forms, and RxJS**, styled with Bootstrap 5.

> **A note on the Angular version:** this was requested as "Angular 22,"
> which does not exist yet at the time of writing. The architecture asked
> for — standalone components, signals, functional guards/interceptors,
> `takeUntilDestroyed`, `linkedSignal` — **is** the current, real Angular
> API surface (Angular 17–19+). This project is built and pinned against
> **Angular 19**, the latest actual stable release, using those exact
> patterns. Bump the version in `package.json` once Angular 22 ships if you
> want to track it.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Angular 19 (standalone components, no NgModules) |
| Language | TypeScript (strict mode) |
| Styling | SCSS + Bootstrap 5 + Bootstrap Icons |
| State | Angular Signals (`signal`, `computed`, `effect`, `linkedSignal`) |
| HTTP | `HttpClient` + functional interceptors |
| Forms | Reactive Forms + custom validators |
| Routing | Angular Router, lazy-loaded feature routes, functional guards |
| Reactivity | RxJS (`switchMap`, `debounceTime`, `forkJoin`, `shareReplay`, etc.) |

---

## 2. Project Structure

```
src/
├── app/
│   ├── core/                     # Singleton, app-wide concerns
│   │   ├── guards/                # authGuard, guestGuard, roleGuard
│   │   ├── interceptors/          # auth, error, loading
│   │   ├── services/               # ApiService, AuthService, ToastService, LoadingService
│   │   └── models/                 # All TS interfaces/enums (barrel export via index.ts)
│   ├── shared/                    # Reusable, stateless building blocks
│   │   ├── layout/                 # Navbar, Sidebar, MainLayout shell
│   │   ├── components/             # Toast, Pagination, ConfirmDialog
│   │   ├── pipes/, directives/, validators/
│   ├── features/                  # One folder per business module (lazy-loaded)
│   │   ├── auth/                   # Login, Register, Forgot Password
│   │   ├── dashboard/               # Stats, charts, latest activity
│   │   ├── employee/                # Full CRUD + search/sort/filter/paginate
│   │   ├── user/                    # Full CRUD
│   │   ├── department/               # Full CRUD
│   │   ├── profile/                  # Update profile, change password, upload avatar
│   │   ├── settings/                  # Theme, notifications, preferences
│   │   └── errors/                   # 404, 403 pages
│   ├── app.config.ts               # Providers: router, http+interceptors, animations
│   ├── app.routes.ts               # Root route table
│   └── app.component.*
├── environments/                  # environment.ts / environment.prod.ts
└── styles/                        # Design tokens: variables, mixins, functions, themes
```

**Why this shape?**
- `core/` holds anything that should exist exactly once for the whole app
  (HTTP plumbing, auth state, guards). Nothing in `core/` is a component.
- `shared/` holds dumb, reusable UI — no feature-specific business logic.
- `features/` is one folder per domain module, each lazy-loaded via
  `loadChildren`/`loadComponent` so the initial bundle only contains what's
  needed for the login screen.

---

## 3. Getting Started

### Prerequisites
- Node.js 18.19+ (or 20+)
- npm 9+

### Install & run

```bash
npm install
npm start
```

The app serves at `http://localhost:4200`. It expects a REST API at the URL
configured in `src/environments/environment.ts` (`apiUrl`, default
`http://localhost:3000/api/v1`) — see the API contract in section 5 below.

### Build for production

```bash
npm run build:prod
```

Output goes to `dist/crm-employee-dashboard`.

### Other scripts

```bash
npm run watch   # incremental dev build
npm test        # unit tests via Karma
```

---

## 4. Architecture Notes

### Routing & Guards
- `app.routes.ts` lazy-loads every feature. Authenticated routes are nested
  under a `MainLayoutComponent` (navbar + sidebar + `<router-outlet>`)
  guarded by `authGuard`.
- `guestGuard` keeps a logged-in user off the login/register screens.
- `roleGuard(roles: UserRole[])` is a **guard factory** — pass allowed
  roles per-route (e.g. Users & Departments are Admin/Manager only).

### HTTP Interceptor Chain
Registered in `app.config.ts` in this order:
1. `loadingInterceptor` — increments/decrements a global request counter.
2. `authInterceptor` — attaches `Authorization: Bearer <token>`.
3. `errorInterceptor` — centralizes 401/403/network error handling and
   toast notifications, so feature services don't repeat this logic.

### State Management
No NgRx/Akita — Signals are sufficient at this scale:
- `AuthService.currentUser` is a signal; `isAuthenticated`/`isAdmin` are
  `computed()` from it.
- `LoadingService`/`ToastService` are signal-backed and read directly in
  templates.
- `SettingsComponent` demonstrates `effect()` (theme persisted to
  `localStorage` + applied to the DOM) and `linkedSignal()` (email digest
  frequency tracks the notifications master switch but stays
  user-overridable).

### RxJS Patterns in Use
- `switchMap` + `debounceTime` + `distinctUntilChanged` — employee/user/
  department search boxes (cancels stale in-flight requests).
- `forkJoin` — Dashboard fires 6 parallel GETs and resolves once.
- `shareReplay` — department/manager lookup dropdowns are cached per
  session so navigating create → edit doesn't refetch.
- `retry(1)` — one silent retry on read-only GET list endpoints.
- `finalize` — pairs every submit button's spinner with its request.
- `catchError` — every list/service call fails soft (empty state) rather
  than crashing the component; the error interceptor still toasts it.
- `takeUntilDestroyed()` — used on every component-level subscription
  instead of manual `Subscription` teardown.

### Forms
All forms are Reactive Forms with a shared `CustomValidators` class
(`email`, `strongPassword`, `matchFields`, `notBlank`, `phone`). Templates
use the `f = form.controls` getter pattern for clean `*ngIf`/`@if` error
blocks.

---

## 5. REST API Contract

The frontend assumes a backend already exists at `environment.apiUrl`.
Every request/response shape below is exactly what the services in this
repo send/expect.

### Auth
| Method | Path | Payload | Notes |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | Returns `{ accessToken, refreshToken, user }` |
| POST | `/auth/register` | `{ name, email, password, confirmPassword }` | Same response shape as login |
| POST | `/auth/forgot-password` | `{ email }` | Returns `{ sent: boolean }` |
| POST | `/auth/reset-password` | `{ token, password, confirmPassword }` | |
| PATCH | `/auth/change-password` | `{ currentPassword, newPassword, confirmPassword }` | |

### Employees
| Method | Path | Payload |
|---|---|---|
| GET | `/employees?search=&departmentId=&status=&page=&pageSize=&sortBy=&sortDir=` | — |
| GET | `/employees/:id` | — |
| POST | `/employees` | `{ firstName, lastName, email, phone, jobTitle, departmentId, status, salary, hireDate }` |
| PUT | `/employees/:id` | same shape as POST (full replace) |
| PATCH | `/employees/:id` | any subset of the above |
| DELETE | `/employees/:id` | — |
| GET | `/departments/lookup` | — → `[{ id, name }]` |

### Users
| Method | Path | Payload |
|---|---|---|
| GET | `/users?search=&page=&pageSize=` | — |
| GET / POST / PUT / PATCH / DELETE | `/users(/:id)` | `{ name, email, password?, role, isActive? }` |

### Departments
| Method | Path | Payload |
|---|---|---|
| GET / POST / PUT / DELETE | `/departments(/:id)` | `{ name, code, managerId }` |
| GET | `/users/managers-lookup` | — → `User[]` |

### Profile
| Method | Path | Payload |
|---|---|---|
| GET | `/profile` | — |
| PATCH | `/profile` | `{ name, email }` |
| POST | `/profile/avatar` | `multipart/form-data`, field `avatar` |

### Dashboard
`GET /dashboard/stats`, `/dashboard/charts/employees-by-department`,
`/dashboard/charts/hires-by-month`, `/dashboard/latest-users?limit=`,
`/dashboard/latest-employees?limit=`, `/dashboard/latest-activity?limit=`.

### Standard response envelopes

```jsonc
// Single item
{ "success": true, "message": "Employee created", "data": { "id": 12, "...": "..." } }

// List
{
  "success": true,
  "message": "OK",
  "data": [ /* items */ ],
  "meta": { "page": 1, "pageSize": 10, "totalItems": 42, "totalPages": 5 }
}
```

---

## 6. Roles

`UserRole` enum: `ADMIN`, `MANAGER`, `EMPLOYEE`.
- Users & Departments modules: Admin + Manager only (`roleGuard`, also
  hidden from the sidebar for Employees).
- Everything else is available to any authenticated user.

---

## 7. What's Mocked vs. Real

Every service in this repo makes **real `HttpClient` calls** to the
endpoints documented above — there's no fake/mock data layer. You need a
running backend implementing the contract in section 5 (or a tool like
`json-server` seeded to match it) for the app to display real data.
