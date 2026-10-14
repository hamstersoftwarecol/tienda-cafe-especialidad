-- Esquema D1 para Cloudflare Workers
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    variety TEXT NOT NULL,
    process TEXT NOT NULL,
    altitude_masl INTEGER NOT NULL,
    sca_score REAL NOT NULL,
    tasting_notes TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 50,
    image_url TEXT,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    phone TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    grind_type TEXT NOT NULL,
    weight_grams INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Datos iniciales de la finca cafetera
INSERT OR IGNORE INTO products (id, name, slug, variety, process, altitude_masl, sca_score, tasting_notes, description, price, stock, image_url, is_featured)
VALUES 
(1, 'Geisha Reserva La Esperanza', 'geisha-reserva-la-esperanza', 'Geisha', 'Lavado Clásico Prolongado', 1950, 89.5, 'Jazmín, Flor de Azahar, Melocotón blanco, Bergamota', 'Cosechado manualmente en el punto óptimo de maduración en las faldas de la cordillera. Un perfil floral y sedoso de clase mundial que redefine la elegancia en taza.', 54000, 40, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80', 1),
(2, 'Bourbon Rosado Finca El Mirador', 'bourbon-rosado-el-mirador', 'Bourbon Rosado', 'Natural Anaeróbico 72h', 1820, 88.0, 'Frutos rojos, Fresa silvestre, Papaya madura, Chocolate ruby', 'Fermentación controlada en cereza entera durante 72 horas en tanques sellados sin oxígeno. Una explosión frutal con dulzura almibarada.', 46000, 65, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 1),
(3, 'Castillo Honey El Paraíso', 'castillo-honey-el-paraiso', 'Castillo Naranjal', 'Yellow Honey', 1750, 86.5, 'Miel de caña, Caramelo tostado, Manzana roja, Nuez moscada', 'Despulpado conservando el 80% del mucílago y secado lentamente en camas africanas sombreadas. Cuerpo cremoso y dulzor persistente.', 38000, 90, 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80', 1),
(4, 'Tabi Ancestral Lavado', 'tabi-ancestral-lavado', 'Tabi (Typica x Bourbon x Timor)', 'Lavado Doble Fermentación', 1880, 87.0, 'Cítricos dulces, Mandarina, Té negro, Panela', 'Variedad de grano grande y porte alto desarrollada para preservar la taza tradicional colombiana con una acidez cítrica brillante y cuerpo redondo.', 42000, 50, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80', 0);

-- Usuario Administrador Finca
INSERT OR IGNORE INTO users (id, name, email, password_hash, role)
VALUES (1, 'Administrador Finca', 'admin@fincacafe.com', '$2a$10$wT5f4z9Z2VbK4g9g6k2wOeqV5N1rM2jY3F9wG6jK7q1wX8b0c.W2q', 'admin');
