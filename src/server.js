const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Session configuration
app.use(session({
    secret: 'finca-cafe-especialidad-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

// Main routes
app.use('/', routes);

// Start server
app.listen(PORT, () => {
    console.log(`☕ Tienda de Café de Especialidad corriendo en http://localhost:${PORT}`);
});

module.exports = app;
