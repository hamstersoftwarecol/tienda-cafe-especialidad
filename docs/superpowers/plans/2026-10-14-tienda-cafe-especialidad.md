# Specialty Coffee Web Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete specialty coffee e-commerce web platform in Swift (Vapor 4) for a coffee-growing estate, featuring farm traceability, catalog with grind/weight variants, authentication, shopping cart, and order processing with SQLite persistence.

**Architecture:** Server-side rendered (SSR) web application using Vapor 4, Leaf templating engine, Fluent ORM with SQLite driver, Session-based authentication with Bcrypt password hashing, and Tailwind CSS for responsive typography and styling.

**Tech Stack:** Swift 6.x, Vapor 4.110+, Leaf 4.4+, Fluent 4.12+, FluentSQLiteDriver 4.8+, Tailwind CSS (via CDN/static assets).

**Spec:** `docs/superpowers/specs/2026-10-14-tienda-cafe-especialidad-design.md`

## Global Constraints
- Target Language: Swift 6.3 (Swift Package Manager `Package.swift`)
- Database: SQLite via `fluent-sqlite-driver` (file: `cafe.sqlite`)
- Views: Leaf templating engine (`Resources/Views/**/*.leaf`)
- Static Files: Static file middleware serving from `Public/`
- Security: Passwords hashed with `Bcrypt.hash()`, session cookies enabled.

---

### Task 1: Initialize Vapor Project Scaffolding and Dependencies

**Files:**
- Create: `Package.swift`
- Create: `Sources/App/entrypoint.swift`
- Create: `Sources/App/configure.swift`
- Create: `Sources/App/routes.swift`
- Create: `Tests/AppTests/AppTests.swift`

**Interfaces:**
- Consumes: Standard Swift Package Manager
- Produces: Runnable Vapor application with SQLite, Fluent, Leaf and Session middleware configured.

- [ ] **Step 1: Write `Package.swift` with Vapor, Fluent, FluentSQLite, and Leaf dependencies**
- [ ] **Step 2: Create directory tree (`Sources/App`, `Tests/AppTests`, `Public/css`, `Resources/Views`)**
- [ ] **Step 3: Write `Sources/App/configure.swift` and `Sources/App/routes.swift` configuring Leaf, Fluent SQLite, Sessions, and StaticFileMiddleware**
- [ ] **Step 4: Write `Sources/App/entrypoint.swift` with `@main` entrypoint**
- [ ] **Step 5: Write initial failing smoke test in `Tests/AppTests/AppTests.swift`**
- [ ] **Step 6: Run `swift build` and `swift test` to verify build and test pass**
- [ ] **Step 7: Commit**

---

### Task 2: Models and Migrations (User, Product, Order, OrderItem)

**Files:**
- Create: `Sources/App/Models/User.swift`
- Create: `Sources/App/Models/Product.swift`
- Create: `Sources/App/Models/Order.swift`
- Create: `Sources/App/Models/OrderItem.swift`
- Create: `Sources/App/Migrations/CreateUser.swift`
- Create: `Sources/App/Migrations/CreateProduct.swift`
- Create: `Sources/App/Migrations/CreateOrder.swift`
- Create: `Sources/App/Migrations/CreateOrderItem.swift`
- Create: `Sources/App/Migrations/SeedProducts.swift`
- Modify: `Sources/App/configure.swift`
- Test: `Tests/AppTests/ModelTests.swift`

**Interfaces:**
- Consumes: Fluent ORM models and migrations
- Produces: Database schema with coffee products, users, orders, and seed data for specialty coffee micro-lots.

- [ ] **Step 1: Write model tests verifying User password hashing and Product properties**
- [ ] **Step 2: Implement User model and `CreateUser` migration**
- [ ] **Step 3: Implement Product model and `CreateProduct` migration with specialty attributes (variety, process, altitude_masl, sca_score, tasting_notes, price_cents, stock_quantity)**
- [ ] **Step 4: Implement Order & OrderItem models and migrations**
- [ ] **Step 5: Implement `SeedProducts` migration to populate authentic Colombian/specialty coffee micro-lots (Geisha, Pink Bourbon, Castillo Natural Anaerobic)**
- [ ] **Step 6: Register migrations in `configure.swift` and verify with `swift test`**
- [ ] **Step 7: Commit**

---

### Task 3: Base Layout, Landing Page and Farm Traceability Views

**Files:**
- Create: `Resources/Views/base.leaf`
- Create: `Resources/Views/index.leaf`
- Create: `Resources/Views/origen.leaf`
- Create: `Public/css/style.css`
- Create: `Sources/App/Controllers/WebsiteController.swift`
- Modify: `Sources/App/routes.swift`
- Test: `Tests/AppTests/WebsiteTests.swift`

**Interfaces:**
- Consumes: Leaf engine, Product model
- Produces: Responsive homepage with hero section, farm origin story, and featured micro-lots.

- [ ] **Step 1: Write tests verifying `GET /` and `GET /origen` return HTTP 200 with Leaf HTML**
- [ ] **Step 2: Create `Resources/Views/base.leaf` with header, navigation bar, footer, and Tailwind styling**
- [ ] **Step 3: Create `Resources/Views/index.leaf` with storytelling of the coffee-growing farm, altitude metrics, and harvest philosophy**
- [ ] **Step 4: Create `Resources/Views/origen.leaf` explaining bean varieties, wet/dry mill processing, and sustainable cultivation**
- [ ] **Step 5: Implement `WebsiteController.swift` serving index with featured products**
- [ ] **Step 6: Run tests with `swift test` and verify HTML response**
- [ ] **Step 7: Commit**

---

### Task 4: Coffee Catalog and Product Details

**Files:**
- Create: `Resources/Views/tienda.leaf`
- Create: `Resources/Views/producto.leaf`
- Create: `Sources/App/Controllers/ProductController.swift`
- Modify: `Sources/App/routes.swift`
- Test: `Tests/AppTests/ProductControllerTests.swift`

**Interfaces:**
- Consumes: Product model
- Produces: `/tienda` catalog page with filtering and `/producto/:slug` detail page with SCA tasting notes and grind/weight selectors.

- [ ] **Step 1: Write tests for `/tienda` and `/producto/:slug` routes (including 404 for invalid slug)**
- [ ] **Step 2: Create `Resources/Views/tienda.leaf` rendering grid of specialty coffees with SCA badges and process tags**
- [ ] **Step 3: Create `Resources/Views/producto.leaf` with interactive selectors for grind type (Whole Bean, Espresso, Filter, French Press) and bag weight (250g, 500g, 1kg)**
- [ ] **Step 4: Implement `ProductController` with listing and slug resolution queries**
- [ ] **Step 5: Verify tests pass with `swift test`**
- [ ] **Step 6: Commit**

---

### Task 5: Authentication (Registration, Login, Session Management, Account Page)

**Files:**
- Create: `Resources/Views/auth/login.leaf`
- Create: `Resources/Views/auth/register.leaf`
- Create: `Resources/Views/auth/cuenta.leaf`
- Create: `Sources/App/Controllers/AuthController.swift`
- Create: `Sources/App/DTOs/AuthDTOs.swift`
- Modify: `Sources/App/routes.swift`
- Test: `Tests/AppTests/AuthTests.swift`

**Interfaces:**
- Consumes: User model, Vapor Session middleware, Bcrypt
- Produces: Secure registration, login, logout, and authenticated `/cuenta` profile route.

- [ ] **Step 1: Write integration tests for registration (validation, duplicate email rejection), login with valid/invalid credentials, and session persistence**
- [ ] **Step 2: Create `AuthDTOs.swift` with `RegisterRequest` and `LoginRequest`**
- [ ] **Step 3: Implement `AuthController.swift` handling GET/POST for register, login, logout, and authenticated user profile**
- [ ] **Step 4: Create Leaf templates for login, registration, and user account with flash error messages**
- [ ] **Step 5: Run tests with `swift test` and verify authentication works**
- [ ] **Step 6: Commit**

---

### Task 6: Shopping Cart & Checkout Flow

**Files:**
- Create: `Sources/App/DTOs/CartDTOs.swift`
- Create: `Sources/App/Services/CartService.swift`
- Create: `Sources/App/Controllers/CartController.swift`
- Create: `Resources/Views/carrito.leaf`
- Create: `Resources/Views/checkout.leaf`
- Create: `Resources/Views/pedido_exitoso.leaf`
- Modify: `Sources/App/routes.swift`
- Test: `Tests/AppTests/CartCheckoutTests.swift`

**Interfaces:**
- Consumes: Session, Product model, Order & OrderItem models, User authentication
- Produces: Cart addition, cart inspection, checkout submission, order record creation in SQLite, and order confirmation.

- [ ] **Step 1: Write unit and integration tests for adding items to cart with specific grind/weight, updating quantities, and placing orders**
- [ ] **Step 2: Implement `CartService.swift` managing session cart state and calculations**
- [ ] **Step 3: Implement `CartController.swift` with `/carrito`, `/carrito/agregar`, `/carrito/eliminar`, `/checkout`**
- [ ] **Step 4: Create Leaf templates for cart summary, checkout form, and successful order screen**
- [ ] **Step 5: Run `swift test` and verify end-to-end checkout flow**
- [ ] **Step 6: Commit**

---

### Task 7: Admin Panel (Product Management & Orders Overview)

**Files:**
- Create: `Sources/App/Controllers/AdminController.swift`
- Create: `Resources/Views/admin/dashboard.leaf`
- Create: `Resources/Views/admin/productos.leaf`
- Create: `Resources/Views/admin/pedidos.leaf`
- Modify: `Sources/App/routes.swift`
- Test: `Tests/AppTests/AdminTests.swift`

**Interfaces:**
- Consumes: Admin role verification on User
- Produces: Protected admin routes at `/admin` for tracking orders and adding/updating specialty coffee lots.

- [ ] **Step 1: Write tests verifying non-admins or guests get 403/redirect when accessing `/admin`**
- [ ] **Step 2: Implement `AdminMiddleware` verifying user has `admin` role**
- [ ] **Step 3: Implement `AdminController` with dashboard metrics, product management, and order status updates**
- [ ] **Step 4: Create responsive admin Leaf templates**
- [ ] **Step 5: Run `swift test` to verify admin security and operations**
- [ ] **Step 6: Commit**

---

### Task 8: Verification, Smoke Testing & Cloudflare Deployment Guide

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `docs/deployment/cloudflare-setup.md`
- Test: Full test suite execution `swift test`

- [ ] **Step 1: Run full test suite with `swift test` to guarantee 100% passing tests**
- [ ] **Step 2: Create multi-stage production `Dockerfile` optimized for Swift on Linux**
- [ ] **Step 3: Create documentation for connecting Cloudflare (DNS, SSL Full/Strict, Caching rules, WAF)**
- [ ] **Step 4: Final commit and verification**
