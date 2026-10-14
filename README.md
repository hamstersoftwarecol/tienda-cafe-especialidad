# ☕ Café Origen - Tienda de Café de Especialidad & Caficultura

> Plataforma web de comercio electrónico y portal de finca caficultora para café de especialidad y microlotes de altura (1,850 m.s.n.m.), desplegada en el Edge global mediante **Cloudflare Workers** y **Cloudflare D1**.

[![Cloudflare Workers](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-F38020?style=flat&logo=cloudflare&logoColor=white)](https://tienda-cafe-especialidad.business-alejandrolopezmurillo.workers.dev)
[![Database](https://img.shields.io/badge/Database-Cloudflare%20D1%20(SQLite)-0051C3?style=flat&logo=sqlite&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Hono Framework](https://img.shields.io/badge/Framework-Hono%20Web%20Standards-E36002?style=flat)](https://hono.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌐 Demo en Producción

Puedes visitar y probar la tienda en vivo aquí:  
👉 **[https://tienda-cafe-especialidad.business-alejandrolopezmurillo.workers.dev](https://tienda-cafe-especialidad.business-alejandrolopezmurillo.workers.dev)**

---

## 🍃 Características Principales

* **Trazabilidad y Origen de Finca:** Fichas técnicas completas con altitud de cultivo (m.s.n.m.), variedad botánica (Geisha, Bourbon Rosado, Castillo, Tabi), método de beneficio (Lavado, Natural Anaeróbico, Honey) y puntaje de catación SCA (>86+ puntos).
* **Personalización en Taza:** Selector interactivo de molienda (Grano entero, V60/Filtro, Espresso, Prensa Francesa, Aeropress) y gramaje (250g, 500g, 1000g).
* **Carrito y Checkout Completo:** Persistencia de cesta en cookies de sesión y almacenamiento seguro de pedidos.
* **Guías de Barismo en Casa (`/metodos`):** Parámetros calibrados en finca para ratios de agua, temperaturas y tiempos de extracción.
* **Club de Suscripciones (`/suscripciones`):** Planes mensuales y quincenales para recibir café recién tostado.
* **Canal Mayorista B2B (`/mayoristas`):** Solicitud y cotización de café para cafeterías, restaurantes y exportación en sacos verdes.
* **Panel de Control para Finca (`/admin`):** Métricas de ventas, inventario de lotes y actualización del estado de tueste y despacho.

---

## 🛠️ Tecnologías

* **Edge Runtime:** Cloudflare Workers (arranque en 2 ms).
* **Framework:** [Hono](https://hono.dev/) para estándares web ligeros y rápidos.
* **Base de Datos:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (Base de datos SQL / SQLite serverless distribuida).
* **Estilos:** Tailwind CSS con tipografías Playfair Display y Plus Jakarta Sans.
* **Compatibilidad Dual:** Incluye también versión en Node.js Express (`src/server.js`) y Dockerfile para despliegue en VPS/Render/Fly.io.

---

## 🚀 Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/hamstersoftwarecol/tienda-cafe-especialidad.git
   cd tienda-cafe-especialidad
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Inicializar la base de datos local (D1):**
   ```bash
   npm run d1:init
   ```

4. **Ejecutar el simulador de Cloudflare Worker:**
   ```bash
   npm run worker:dev
   ```
   Abre en tu navegador: `http://localhost:8787`

5. *(Opcional)* Si prefieres correrlo en Node.js tradicional:
   ```bash
   npm run dev
   ```
   Abre en tu navegador: `http://localhost:3000`

---

## 🚢 Despliegue en Cloudflare

Para publicar cambios directamente a tu cuenta de Cloudflare:

```bash
# Migrar la base de datos remota en Cloudflare
npm run d1:init:prod

# Desplegar el Worker a nivel global
npm run worker:deploy
```

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Creado con pasión por el campo y el café de alta gama.
