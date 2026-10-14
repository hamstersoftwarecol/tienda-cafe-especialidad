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

**Global Constraints & Context:**
- Target Language: Swift 6.x
- Package Name: `paginaweb` or `App`
- Dependencies to declare in Package.swift:
  - `vapor/vapor` (from: "4.110.0")
  - `vapor/fluent` (from: "4.12.0")
  - `vapor/fluent-sqlite-driver` (from: "4.8.0")
  - `vapor/leaf` (from: "4.4.0")
- Targets:
  - `.executableTarget(name: "App", dependencies: [ ... ])`
  - `.testTarget(name: "AppTests", dependencies: [.target(name: "App"), .product(name: "XCTVapor", package: "vapor")])`
- Configure `app.views.use(.leaf)` and `app.databases.use(.sqlite(.file("cafe.sqlite")), as: .sqlite)`.
- Configure `app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))`
- Configure `app.middleware.use(app.sessions.middleware)`
