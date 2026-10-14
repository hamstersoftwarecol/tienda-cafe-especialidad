const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');

// Helper to render view wrapped in layout
function renderWithLayout(res, req, view, data = {}) {
    req.app.render(view, {
        user: req.session.user || null,
        cartCount: req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0,
        flash: req.session.flash || {},
        ...data
    }, (err, html) => {
        if (err) {
            console.error('Render error:', err);
            return res.status(500).send('Error rendering template: ' + err.message);
        }
        delete req.session.flash;
        res.render('layout', {
            title: data.title || '',
            user: req.session.user || null,
            cartCount: req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0,
            flash: req.session.flash || {},
            body: html
        });
    });
}

// Home Page
router.get('/', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY is_featured DESC, id DESC').all();
    const featuredProducts = products.filter(p => p.is_featured === 1);
    renderWithLayout(res, req, 'index', {
        title: 'Café de Especialidad Directo de Finca',
        products,
        featuredProducts: featuredProducts.length > 0 ? featuredProducts : products
    });
});

// Origen / Finca Story Page
router.get('/origen', (req, res) => {
    renderWithLayout(res, req, 'origen', {
        title: 'Nuestra Finca y Caficultura'
    });
});

// Métodos de Preparación
router.get('/metodos', (req, res) => {
    renderWithLayout(res, req, 'metodos', {
        title: 'Guías de Preparación & Barismo en Casa'
    });
});

// Suscripciones de Café
router.get('/suscripciones', (req, res) => {
    renderWithLayout(res, req, 'suscripciones', {
        title: 'Club de Suscripción Cafetera'
    });
});

// Mayoristas / B2B
router.get('/mayoristas', (req, res) => {
    renderWithLayout(res, req, 'mayoristas', {
        title: 'Café de Especialidad para Cafeterías & Mayoristas'
    });
});

router.post('/mayoristas', (req, res) => {
    const { name, businessName } = req.body;
    req.session.flash = { 
        success: `¡Gracias ${name}! Hemos recibido la solicitud para "${businessName}". Nuestro equipo de finca te enviará la lista mayorista por WhatsApp/correo.` 
    };
    res.redirect('/mayoristas');
});

// Catalog Page
router.get('/tienda', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    renderWithLayout(res, req, 'tienda', {
        title: 'Catálogo de Microlotes de Café',
        products
    });
});

// Single Product Detail Page
router.get('/producto/:slug', (req, res) => {
    const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
    if (!product) {
        return res.status(404).redirect('/tienda');
    }
    renderWithLayout(res, req, 'producto', {
        title: product.name,
        product
    });
});

// Cart view
router.get('/carrito', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    renderWithLayout(res, req, 'carrito', {
        title: 'Carrito de Compras',
        cart,
        total
    });
});

// Add to cart
router.post('/carrito/agregar', (req, res) => {
    const { productId, weight, grind, quantity } = req.body;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
        return res.redirect('/tienda');
    }

    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Weight price multiplier (250g is base price, 500g has discount, 1000g has bulk discount)
    const weightNum = parseInt(weight, 10) || 250;
    let unitPrice = product.price;
    if (weightNum === 500) {
        unitPrice = product.price * 1.9;
    } else if (weightNum === 1000) {
        unitPrice = product.price * 3.6;
    }

    const itemQuantity = parseInt(quantity, 10) || 1;

    // Check if same product + grind + weight exists
    const existingIndex = req.session.cart.findIndex(i => 
        i.id === product.id && i.weight === weightNum && i.grind === grind
    );

    if (existingIndex > -1) {
        req.session.cart[existingIndex].quantity += itemQuantity;
    } else {
        req.session.cart.push({
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            grind: grind,
            weight: weightNum,
            price: unitPrice,
            quantity: itemQuantity
        });
    }

    req.session.flash = { success: `¡Añadiste "${product.name}" al carrito!` };
    res.redirect('/carrito');
});

// Remove from cart
router.post('/carrito/eliminar', (req, res) => {
    const index = parseInt(req.body.index, 10);
    if (req.session.cart && req.session.cart[index]) {
        req.session.cart.splice(index, 1);
    }
    res.redirect('/carrito');
});

// Checkout View
router.get('/checkout', (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
        return res.redirect('/tienda');
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    renderWithLayout(res, req, 'checkout', {
        title: 'Checkout Seguro',
        cart,
        total
    });
});

// Process Checkout
router.post('/checkout', (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
        return res.redirect('/tienda');
    }

    const { customerName, customerEmail, phone, shippingAddress } = req.body;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const userId = req.session.user ? req.session.user.id : null;

    const createOrder = db.transaction(() => {
        const orderResult = db.prepare(`
            INSERT INTO orders (user_id, customer_name, customer_email, shipping_address, phone, total, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `).run(userId, customerName, customerEmail, shippingAddress, phone, total);

        const orderId = orderResult.lastInsertRowid;
        const insertItem = db.prepare(`
            INSERT INTO order_items (order_id, product_id, grind_type, weight_grams, unit_price, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const item of cart) {
            insertItem.run(orderId, item.id, item.grind, item.weight, item.price, item.quantity);
        }

        return orderId;
    });

    const orderId = createOrder();
    req.session.cart = []; // Clear cart

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    renderWithLayout(res, req, 'pedido_exitoso', {
        title: '¡Pedido Confirmado!',
        order
    });
});

// Auth: Login GET
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/cuenta');
    renderWithLayout(res, req, 'auth/login', { title: 'Iniciar Sesión' });
});

// Auth: Login POST
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        req.session.flash = { error: 'Correo o contraseña incorrectos.' };
        return res.redirect('/login');
    }

    req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    req.session.flash = { success: `¡Bienvenido de nuevo, ${user.name}!` };
    res.redirect(user.role === 'admin' ? '/admin' : '/cuenta');
});

// Auth: Register GET
router.get('/registro', (req, res) => {
    if (req.session.user) return res.redirect('/cuenta');
    renderWithLayout(res, req, 'auth/register', { title: 'Crear Cuenta' });
});

// Auth: Register POST
router.post('/registro', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
        req.session.flash = { error: 'Por favor completa todos los campos (contraseña mínimo 6 caracteres).' };
        return res.redirect('/registro');
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        req.session.flash = { error: 'Ya existe una cuenta con este correo electrónico.' };
        return res.redirect('/registro');
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, 'customer')
    `).run(name, email, passwordHash);

    req.session.user = {
        id: result.lastInsertRowid,
        name,
        email,
        role: 'customer'
    };

    req.session.flash = { success: '¡Cuenta creada exitosamente!' };
    res.redirect('/cuenta');
});

// Auth: Logout
router.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
});

// Auth: User Account Profile & Orders
router.get('/cuenta', (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.session.user.id);
    const orderStmt = db.prepare(`
        SELECT oi.*, p.name as product_name 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    `);

    for (const order of orders) {
        order.items = orderStmt.all(order.id);
    }

    renderWithLayout(res, req, 'auth/cuenta', {
        title: 'Mi Cuenta',
        orders
    });
});

// Admin Middleware
function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        req.session.flash = { error: 'Acceso restringido para administradores de la finca.' };
        return res.redirect('/login');
    }
    next();
}

// Admin Dashboard
router.get('/admin', requireAdmin, (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

    renderWithLayout(res, req, 'admin/dashboard', {
        title: 'Panel Administrador Finca',
        orders,
        products,
        totalSales
    });
});

// Admin: Formulario nuevo producto
router.get('/admin/productos/nuevo', requireAdmin, (req, res) => {
    renderWithLayout(res, req, 'admin/nuevo_producto', {
        title: 'Registrar Nuevo Lote de Café'
    });
});

// Admin: Guardar nuevo producto
router.post('/admin/productos/nuevo', requireAdmin, (req, res) => {
    const { name, slug, variety, process, altitude_masl, sca_score, tasting_notes, description, price, stock, image_url, is_featured } = req.body;
    
    try {
        db.prepare(`
            INSERT INTO products (name, slug, variety, process, altitude_masl, sca_score, tasting_notes, description, price, stock, image_url, is_featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            name, 
            slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'), 
            variety, 
            process, 
            parseInt(altitude_masl, 10), 
            parseFloat(sca_score), 
            tasting_notes, 
            description, 
            parseFloat(price), 
            parseInt(stock, 10) || 50, 
            image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80', 
            is_featured ? 1 : 0
        );

        req.session.flash = { success: `¡Lote "${name}" creado y publicado exitosamente en el catálogo!` };
        res.redirect('/admin');
    } catch (err) {
        console.error('Error al crear producto:', err);
        req.session.flash = { error: 'Error al registrar el lote: ' + err.message };
        res.redirect('/admin/productos/nuevo');
    }
});

// Admin: Update order status
router.post('/admin/pedidos/:id/estado', requireAdmin, (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    req.session.flash = { success: `Estado del pedido #${req.params.id} actualizado a "${status}".` };
    res.redirect('/admin');
});

// Admin: Delete product
router.post('/admin/productos/:id/eliminar', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    req.session.flash = { success: 'Lote de café eliminado del catálogo.' };
    res.redirect('/admin');
});

module.exports = router;
