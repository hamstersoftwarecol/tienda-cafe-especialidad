# Despliegue de la Tienda de Café de Especialidad con Cloudflare

Esta guía explica cómo conectar la aplicación web de tu empresa caficultora a **Cloudflare** para obtener máxima velocidad (CDN en el Edge), certificado SSL/HTTPS automático y protección contra ciberataques.

---

## 1. Opciones de Hosting para el Servidor Web

La tienda utiliza Node.js v24 y SQLite. Puedes hospedarla en cualquier proveedor que permita ejecutar un proceso de Node.js o contenedor:

### Opción A: Fly.io / Render / Railway (Recomendada y muy rápida)
1. **Render.com o Railway.app:**
   - Creas un "Web Service", conectas este repositorio Git.
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Te entrega una URL pública (ejemplo: `mi-finca-cafe.onrender.com`).

---

## 2. Configurar Cloudflare con tu Dominio Propio

Una vez tengas tu servidor activo:

1. **Agregar Dominio en Cloudflare:**
   - Inicia sesión en [dash.cloudflare.com](https://dash.cloudflare.com).
   - Haz clic en **"Add a Site"** e ingresa tu dominio (ej: `cafedeespecialidad.com`).
   - Selecciona el plan **Free** (incluye SSL, CDN, DDoS protection y reglas de caché gratis).

2. **Cambiar los Nameservers:**
   - En tu registrador de dominio (GoDaddy, Namecheap, Google Domains/Squarespace, etc.), cambia los DNS primarios por los que te indique Cloudflare (ej: `ara.ns.cloudflare.com` y `noah.ns.cloudflare.com`).

3. **Configurar los Registros DNS en Cloudflare:**
   - Ve a la pestaña **DNS** > **Records**.
   - Agrega un registro tipo `CNAME` o `A`:
     - **Tipo:** `CNAME`
     - **Nombre:** `@` (o `www`)
     - **Destino:** La URL de tu servidor (ej. `mi-finca-cafe.onrender.com`)
     - **Proxy status:** **Proxied (Nube Naranja activa)** 🟠

---

## 3. Optimización y Seguridad de Café de Especialidad en Cloudflare

1. **SSL/TLS:**
   - Ve a **SSL/TLS** en Cloudflare y selecciona el modo **Full** o **Full (strict)**.
   - Activa **Always Use HTTPS** para que todo el tráfico sea seguro.

2. **Caché Inteligente de Imágenes:**
   - Las imágenes de café, cerezas y empaques se benefician del almacenamiento en caché perimetral de Cloudflare.
   - En **Caching** > **Cache Rules**, crea una regla para la ruta `/images/*` o extensiones `.jpg, .png, .webp` con "Eligible for cache".

3. **Seguridad contra Bots y Spam en Checkout:**
   - En **Security** > **WAF**, la protección DDoS y bot mitigation básica de Cloudflare protegerán automáticamente los formularios de registro y checkout.
