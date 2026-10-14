# SDD ledger — plan: docs/superpowers/plans/2026-10-14-tienda-cafe-especialidad.md

## Pre-flight Conflict Scan
| Task A | Task B | Shared Interface / Concern | Finding / Ruling |
|---|---|---|---|
| Task 1 (Scaffolding) | Task 2 (Models) | Package.swift dependencies (Fluent, SQLite, Leaf) | Task 1 defines full dependencies so Task 2 can import them cleanly. Clean. |
| Task 2 (Models) | Task 3 (Views) | Product model fields (variety, process, sca_score) | Task 3 views consume exact properties declared in Task 2. Clean. |
| Task 2 (Models) | Task 4 (Catalog) | Product slug and variants | Slug must be unique and indexed for routing. Clean. |
| Task 2 (Models) | Task 5 (Auth) | User model & password_hash | Session-based auth with Bcrypt hashing. Clean. |
| Task 5 (Auth) | Task 6 (Checkout) | User session + Order relation | Order belongs to User or Guest with user_id optional/required. Will ensure user_id is linked to authenticated session. |
| Task 5 (Auth) | Task 7 (Admin) | User role check | `user.role == "admin"` controls admin middleware. Clean. |

Pre-flight scan: Clean. No contradictory requirements.
