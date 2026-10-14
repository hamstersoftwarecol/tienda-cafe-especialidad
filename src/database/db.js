const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', '..', 'cafe.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'customer', -- 'customer' or 'admin'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Products table (Specialty coffee lots)
    db.exec(`
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
    `);

    // Orders table
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            shipping_address TEXT NOT NULL,
            phone TEXT NOT NULL,
            total REAL NOT NULL,
            status TEXT DEFAULT 'pending', -- pending, paid, preparing, shipped, delivered
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);

    // Order items table
    db.exec(`
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
    `);

    // Seed default admin and specialty coffee lots if empty
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    if (productCount === 0) {
        const insertProduct = db.prepare(`
            INSERT INTO products (name, slug, variety, process, altitude_masl, sca_score, tasting_notes, description, price, stock, image_url, is_featured)
            VALUES (@name, @slug, @variety, @process, @altitude_masl, @sca_score, @tasting_notes, @description, @price, @stock, @image_url, @is_featured)
        `);

        const lots = [
            {
                name: 'Geisha Reserva La Esperanza',
                slug: 'geisha-reserva-la-esperanza',
                variety: 'Geisha',
                process: 'Lavado Clásico Prolongado',
                altitude_masl: 1950,
                sca_score: 89.5,
                tasting_notes: 'Jazmín, Flor de Azahar, Melocotón blanco, Bergamota',
                description: 'Cosechado manualmente en el punto óptimo de maduración en las faldas de la cordillera. Un perfil floral y sedoso de clase mundial que redefine la elegancia en taza.',
                price: 54000,
                stock: 40,
                image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
                is_featured: 1
            },
            {
                name: 'Bourbon Rosado Finca El Mirador',
                slug: 'bourbon-rosado-el-mirador',
                variety: 'Bourbon Rosado',
                process: 'Natural Anaeróbico 72h',
                altitude_masl: 1820,
                sca_score: 88.0,
                tasting_notes: 'Frutos rojos, Fresa silvestre, Papaya madura, Chocolate ruby',
                description: 'Fermentación controlada en cereza entera durante 72 horas en tanques sellados sin oxígeno. Una explosión frutal con dulzura almibarada.',
                price: 46000,
                stock: 65,
                image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
                is_featured: 1
            },
            {
                name: 'Castillo Honey El Paraíso',
                slug: 'castillo-honey-el-paraiso',
                variety: 'Castillo Naranjal',
                process: 'Yellow Honey',
                altitude_masl: 1750,
                sca_score: 86.5,
                tasting_notes: 'Miel de caña, Caramelo tostado, Manzana roja, Nuez moscada',
                description: 'Despulpado conservando el 80% del mucílago y secado lentamente en camas africanas sombreadas. Cuerpo cremoso y dulzor persistente.',
                price: 38000,
                stock: 90,
                image_url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
                is_featured: 1
            },
            {
                name: 'Tabi Ancestral Lavado',
                slug: 'tabi-ancestral-lavado',
                variety: 'Tabi (Typica x Bourbon x Timor)',
                process: 'Lavado Doble Fermentación',
                altitude_masl: 1880,
                sca_score: 87.0,
                tasting_notes: 'Cítricos dulces, Mandarina, Té negro, Panela',
                description: 'Variedad de grano grande y porte alto desarrollada para preservar la taza tradicional colombiana con una acidez cítrica brillante y cuerpo redondo.',
                price: 42000,
                stock: 50,
                image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
                is_featured: 0
            }
        ];

        for (const lot of lots) {
            insertProduct.run(lot);
        }
    }

    // Default admin user (admin@fincacafe.com / admin123)
    const adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@fincacafe.com');
    if (!adminUser) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.prepare(`
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, 'admin')
        `).run('Administrador Finca', 'admin@fincacafe.com', hashedPassword);
    }
}

initDatabase();

module.exports = db;
