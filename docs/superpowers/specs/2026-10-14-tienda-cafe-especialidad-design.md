# Especificación de Diseño: Tienda de Café de Especialidad en Swift (Vapor)

**Fecha:** 2026-10-14  
**Estado:** Propuesta aprobada en brainstorming  
**Tecnología Base:** Swift 6.x, Vapor 4, Fluent ORM (SQLite), Leaf (SSR), Tailwind CSS

---

## 1. Visión General
Plataforma e-commerce y portal corporativo para una empresa caficultora y de café de especialidad. Permite conectar a los consumidores directamente con el origen (trazabilidad de finca, microlotes, proceso de beneficio y notas de cata SCA) mientras ofrece una tienda en línea completa con autenticación, carrito y gestión de pedidos.

---

## 2. Arquitectura de Software

- **Framework Web:** [Vapor 4](https://vapor.codes/) (Swift concurrente con `async/await`).
- **Capa de Persistencia:** Fluent ORM con driver `fluent-sqlite-driver`.
- **Motor de Vistas / SSR:** Leaf (plantillas `.leaf` con componentes reutilizables).
- **Estilos y UI:** Tailwind CSS (diseño responsivo, estética rústica y moderna para café de especialidad).
- **Seguridad y Sesiones:** Middleware de sesión de Vapor con autenticación por cookies y hashing `Bcrypt`.

---

## 3. Modelo de Datos (Fluent Migrations & Models)

1. **User (`users`)**:
   - `id`: UUID (Primary Key)
   - `name`: String
   - `email`: String (Unique)
   - `password_hash`: String (Bcrypt)
   - `role`: Enum (`customer`, `admin`)
   - `created_at`, `updated_at`: Timestamps

2. **Product (`products`)**:
   - `id`: UUID (Primary Key)
   - `name`: String (ej. "Geisha El Paraíso")
   - `slug`: String (Unique)
   - `variety`: String (ej. Geisha, Bourbon Rosado, Castillo)
   - `process`: String (ej. Natural Anaeróbico, Lavado, Honey)
   - `altitude_masl`: Int (Metros sobre el nivel del mar, ej. 1850)
   - `sca_score`: Double (Puntaje de catación, ej. 88.5)
   - `tasting_notes`: String (ej. "Jazmín, melocotón, bergamota")
   - `description`: Text
   - `price_cents`: Int (Precio en centavos)
   - `stock_quantity`: Int
   - `image_url`: String
   - `is_featured`: Bool

3. **Cart & CartItem (`session-based` / `cart_items`)**:
   - Manejo en memoria/sesión del cliente con soporte de persistencia para checkout.
   - Opciones por ítem: `product_id`, `grind_type` (Grano entero, Espresso, Filtro, Prensa), `weight_grams` (250g, 500g, 1000g), `quantity`.

4. **Order (`orders`)**:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key a `users`)
   - `status`: Enum (`pending`, `paid`, `roasting_shipping`, `delivered`, `cancelled`)
   - `total_cents`: Int
   - `shipping_address`: Text (JSON o campos estructurados: dirección, ciudad, teléfono)
   - `created_at`: Timestamp

5. **OrderItem (`order_items`)**:
   - `id`: UUID
   - `order_id`: UUID (Foreign Key a `orders`)
   - `product_id`: UUID (Foreign Key a `products`)
   - `grind_type`: String
   - `weight_grams`: Int
   - `unit_price_cents`: Int
   - `quantity`: Int

---

## 4. Estructura de Rutas y Controladores

- **Público / Institucional:**
  - `GET /`: Landing page con historia de la finca cafetera, valores, microlotes destacados.
  - `GET /origen`: Página detallada de la finca, método de cultivo y proceso artesanal.
  - `GET /tienda`: Catálogo con filtros de proceso, variedad y perfil de sabor.
  - `GET /producto/:slug`: Ficha técnica de café con notas de cata, selector de molienda/peso y botón de añadir al carrito.

- **Carrito & Checkout:**
  - `GET /carrito`: Vista del carrito con resumen y cálculos.
  - `POST /carrito/agregar`: Agregar ítem con variantes (molienda, peso, cantidad).
  - `POST /carrito/eliminar`: Quitar producto.
  - `GET /checkout`: Formulario de envío y resumen de pago (requiere login o guest checkout con cuenta).
  - `POST /checkout`: Procesamiento de orden y creación de pedido.

- **Autenticación (`AuthController`):**
  - `GET /registro`, `POST /registro`
  - `GET /login`, `POST /login`
  - `POST /logout`
  - `GET /cuenta`: Perfil y pedidos realizados por el usuario.

- **Administración (`AdminController` - protegido con role `admin`):**
  - `GET /admin`: Dashboard con estadísticas resumidas.
  - `GET /admin/productos`, `POST /admin/productos/nuevo`, `POST /admin/productos/editar/:id`
  - `GET /admin/pedidos`, `POST /admin/pedidos/:id/estado`

---

## 5. Diseño Visual y Experiencia de Usuario (UI/UX)
- Paleta de color tierra / café de especialidad: Marrón tostado cálido (`#2B1E16`), verde oliva de finca (`#2E3D2F`), tonos crema/pergamino (`#F9F6F0`) y detalles dorados/naranja tostado.
- Tipografía limpia y editorial, transmitiendo alta calidad y respeto por el producto agrícola.
- Fichas interactivas de notas de cata tipo rueda de sabores SCA.

---

## 6. Pruebas y Verificación
- Pruebas de integración con `XCTVapor` para:
  - Registro y autenticación de usuarios.
  - Flujo de añadir al carrito y cálculo de totales.
  - Creación de órdenes y validación de stock.
  - Carga y renderizado de las vistas Leaf principales.
