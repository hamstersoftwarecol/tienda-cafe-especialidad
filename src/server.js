const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar trust proxy para reconocer la IP real del cliente detrás de Cloudflare
app.set('trust proxy', 1);

// View engine setup (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos con encabezados de caché perimetral para Cloudflare CDN
app.use(express.static(path.join(__dirname, '..', 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0
}));

// Session configuration compatible con Cloudflare y cookies seguras
app.use(session({
    secret: process.env.SESSION_SECRET || 'finca-cafe-especialidad-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true cuando está tras HTTPS de Cloudflare
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semana
    }
}));

// Main routes
app.use('/', routes);

// Start server
app.listen(PORT, () => {
    console.log(`☕ Tienda de Café de Especialidad corriendo en http://localhost:${PORT}`);
});

module.exports = app;
