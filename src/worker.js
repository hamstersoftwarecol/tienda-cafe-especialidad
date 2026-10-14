import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { layout } from './templates/layout.js';

const app = new Hono();

// Helper para parsear sesión desde cookies en el Worker
function getSession(c) {
  const sessionCookie = getCookie(c, 'cf_cafe_session');
  if (!sessionCookie) return { cart: [], user: null, flash: {} };
  try {
    return JSON.parse(decodeURIComponent(sessionCookie));
  } catch (e) {
    return { cart: [], user: null, flash: {} };
  }
}

function saveSession(c, sessionData) {
  setCookie(c, 'cf_cafe_session', encodeURIComponent(JSON.stringify(sessionData)), {
    path: '/',
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7 // 7 días
  });
}

function render(c, title, content) {
  const session = getSession(c);
  const cartCount = session.cart ? session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const flash = session.flash || {};
  
  // Limpiar flash tras leer
  if (session.flash) {
    session.flash = {};
    saveSession(c, session);
  }

  const html = layout({
    title,
    user: session.user,
    cartCount,
    flash,
    content
  });

  return c.html(html);
}

// 1. Inicio
app.get('/', async (c) => {
  let products = [];
  try {
    const res = await c.env.DB.prepare('SELECT * FROM products ORDER BY is_featured DESC, id DESC').all();
    products = res.results || [];
  } catch (e) {
    console.error('Error querying D1:', e);
  }

  const featured = products.filter(p => p.is_featured === 1);

  const content = `
    <!-- Hero Section -->
    <section class="relative bg-coffee-950 text-white overflow-hidden py-24 lg:py-32">
        <div class="absolute inset-0 opacity-30 mix-blend-overlay">
            <img src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=80" alt="Cafetal" class="w-full h-full object-cover">
        </div>
        <div class="absolute inset-0 bg-gradient-to-r from-coffee-950 via-coffee-950/80 to-transparent"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="max-w-2xl space-y-6">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
                    <i class="fa-solid fa-award"></i> Café de Especialidad &bull; Cosecha 2026
                </div>
                <h1 class="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
                    El alma de la montaña en cada taza.
                </h1>
                <p class="text-lg text-stone-300 font-light leading-relaxed">
                    Somos caficultores de tercera generación. Cosechamos cerezas seleccionadas a mano sobre los 1,850 metros de altura, tostadas semanalmente.
                </p>
                <div class="pt-4 flex flex-wrap gap-4">
                    <a href="/tienda" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-7 py-3.5 rounded-full shadow-lg transition">
                        <span>Comprar Microlotes</span>
                        <i class="fa-solid fa-arrow-right text-sm"></i>
                    </a>
                    <a href="/origen" class="inline-flex items-center gap-2 bg-stone-900/80 hover:bg-stone-800 text-white font-semibold px-7 py-3.5 rounded-full border border-stone-700 transition">
                        <i class="fa-solid fa-mountain"></i>
                        <span>Conocer la Finca</span>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Indicadores -->
    <section class="bg-white border-b border-stone-200 py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-stone-100">
                <div class="p-4"><div class="font-serif text-3xl font-bold text-coffee-900">1,850 m</div><div class="text-xs uppercase font-semibold tracking-widest text-stone-500 mt-1">Altitud Promedio</div></div>
                <div class="p-4"><div class="font-serif text-3xl font-bold text-amber-600">88.5+</div><div class="text-xs uppercase font-semibold tracking-widest text-stone-500 mt-1">Puntaje Catación SCA</div></div>
                <div class="p-4"><div class="font-serif text-3xl font-bold text-coffee-900">100%</div><div class="text-xs uppercase font-semibold tracking-widest text-stone-500 mt-1">Trazable</div></div>
                <div class="p-4"><div class="font-serif text-3xl font-bold text-origin-600">Sombra</div><div class="text-xs uppercase font-semibold tracking-widest text-stone-500 mt-1">Agroforestal</div></div>
            </div>
        </div>
    </section>

    <!-- Microlotes -->
    <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
                <span class="text-xs font-bold text-amber-700 uppercase tracking-widest">Ediciones Limitadas</span>
                <h2 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">Microlotes de Temporada</h2>
            </div>
            <a href="/tienda" class="text-coffee-800 font-semibold hover:text-amber-700 transition flex items-center gap-1 mt-4 md:mt-0 text-sm">
                Ver todo el catálogo (${products.length} lotes) <i class="fa-solid fa-arrow-right text-xs"></i>
            </a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${featured.map(product => `
                <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-stone-200 flex flex-col group">
                    <div class="relative h-64 overflow-hidden bg-stone-100">
                        <img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        <div class="absolute top-4 left-4 bg-coffee-950/90 text-amber-300 text-xs font-bold px-3 py-1 rounded-full backdrop-blur">
                            <i class="fa-solid fa-star text-[10px]"></i> ${product.sca_score} SCA
                        </div>
                        <div class="absolute top-4 right-4 bg-white/90 text-stone-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            ${product.process}
                        </div>
                    </div>
                    <div class="p-6 flex-grow flex flex-col justify-between">
                        <div>
                            <div class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                                Variedad ${product.variety} &bull; ${product.altitude_masl} m.s.n.m.
                            </div>
                            <h3 class="font-serif text-xl font-bold text-stone-900 mb-2">
                                <a href="/producto/${product.slug}" class="hover:text-amber-700 transition">${product.name}</a>
                            </h3>
                            <p class="text-xs text-amber-900 bg-amber-50 rounded-lg p-2.5 border border-amber-200/50 mb-4 font-medium">
                                <i class="fa-solid fa-mug-saucer mr-1 text-amber-600"></i> ${product.tasting_notes}
                            </p>
                            <p class="text-sm text-stone-600 line-clamp-2 mb-4">${product.description}</p>
                        </div>
                        <div class="pt-4 border-t border-stone-100 flex items-center justify-between">
                            <div>
                                <span class="text-xs text-stone-400 block">Bolsa 250g</span>
                                <span class="font-serif text-xl font-bold text-coffee-950">$${Number(product.price).toLocaleString('es-CO')} COP</span>
                            </div>
                            <a href="/producto/${product.slug}" class="bg-coffee-900 hover:bg-amber-600 hover:text-stone-950 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition">
                                Personalizar
                            </a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </section>
  `;
  return render(c, 'Café de Especialidad Directo de Finca', content);
});

// 2. Catálogo de Tienda
app.get('/tienda', async (c) => {
  let products = [];
  try {
    const res = await c.env.DB.prepare('SELECT * FROM products ORDER BY id DESC').all();
    products = res.results || [];
  } catch (e) {
    console.error('Error D1:', e);
  }

  const content = `
    <section class="py-12 bg-white border-b border-stone-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span class="text-xs font-bold text-amber-700 uppercase tracking-widest">Microlotes & Variedades Exóticas</span>
            <h1 class="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2">Catálogo de Café de Especialidad</h1>
        </div>
    </section>
    <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${products.map(p => `
                <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition border border-stone-200 flex flex-col justify-between">
                    <div>
                        <img src="${p.image_url}" alt="${p.name}" class="w-full h-64 object-cover">
                        <div class="p-6">
                            <span class="text-xs font-bold text-amber-700">${p.variety} &bull; ${p.process}</span>
                            <h2 class="font-serif text-xl font-bold text-stone-900 mt-1 mb-2">
                                <a href="/producto/${p.slug}" class="hover:text-amber-700">${p.name}</a>
                            </h2>
                            <p class="text-xs text-amber-900 bg-amber-50 p-2 rounded mb-3">${p.tasting_notes}</p>
                            <p class="text-xs text-stone-500">${p.description}</p>
                        </div>
                    </div>
                    <div class="p-6 pt-0 border-t border-stone-100 flex items-center justify-between mt-4">
                        <span class="font-serif font-bold text-lg text-coffee-950">$${Number(p.price).toLocaleString('es-CO')}</span>
                        <a href="/producto/${p.slug}" class="bg-coffee-900 text-white text-xs font-bold px-4 py-2 rounded-full uppercase hover:bg-amber-600">Configurar</a>
                    </div>
                </div>
            `).join('')}
        </div>
    </section>
  `;
  return render(c, 'Catálogo de Cafés', content);
});

// 3. Ficha de Producto
app.get('/producto/:slug', async (c) => {
  const slug = c.req.param('slug');
  const res = await c.env.DB.prepare('SELECT * FROM products WHERE slug = ?').bind(slug).first();
  if (!res) return c.redirect('/tienda');

  const content = `
    <div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
                <img src="${res.image_url}" alt="${res.name}" class="w-full h-[450px] object-cover rounded-3xl shadow-lg">
                <div class="mt-4 p-4 bg-white rounded-2xl border border-stone-200 grid grid-cols-2 gap-3 text-xs">
                    <div><strong>Variedad:</strong> ${res.variety}</div>
                    <div><strong>Proceso:</strong> ${res.process}</div>
                    <div><strong>Altitud:</strong> ${res.altitude_masl} m.s.n.m.</div>
                    <div><strong>Puntaje SCA:</strong> ${res.sca_score}</div>
                </div>
            </div>
            <div class="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
                <h1 class="font-serif text-3xl font-bold text-stone-900">${res.name}</h1>
                <p class="text-sm text-stone-600">${res.description}</p>
                <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-serif italic text-amber-950">
                    "${res.tasting_notes}"
                </div>

                <form action="/carrito/agregar" method="POST" class="space-y-4">
                    <input type="hidden" name="productId" value="${res.id}">
                    <div>
                        <label class="block text-xs font-bold uppercase text-stone-600 mb-1">Molienda:</label>
                        <select name="grind" class="w-full bg-stone-50 border p-3 rounded-xl text-sm">
                            <option value="Grano Entero">En Grano Entero</option>
                            <option value="Molienda Media - V60 / Filtro">Molienda Media (V60, Filtro)</option>
                            <option value="Molienda Fina - Espresso">Molienda Fina (Espresso, Moka)</option>
                            <option value="Molienda Gruesa - Prensa">Molienda Gruesa (Prensa Francesa)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase text-stone-600 mb-1">Peso:</label>
                        <select name="weight" class="w-full bg-stone-50 border p-3 rounded-xl text-sm">
                            <option value="250">250g</option>
                            <option value="500">500g</option>
                            <option value="1000">1000g</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full bg-coffee-900 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl text-sm uppercase">
                        Añadir al Carrito &bull; $${Number(res.price).toLocaleString('es-CO')} COP
                    </button>
                </form>
            </div>
        </div>
    </div>
  `;
  return render(c, res.name, content);
});

// 4. Carrito
app.get('/carrito', (c) => {
  const session = getSession(c);
  const cart = session.cart || [];
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const content = `
    <div class="py-12 max-w-5xl mx-auto px-4">
        <h1 class="font-serif text-3xl font-bold mb-8">Carrito de Compras</h1>
        ${cart.length === 0 ? `
            <div class="bg-white p-12 text-center rounded-3xl border border-stone-200">
                <p class="text-stone-500 mb-4">Tu carrito está vacío.</p>
                <a href="/tienda" class="bg-coffee-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase">Ver Cafés</a>
            </div>
        ` : `
            <div class="space-y-4">
                ${cart.map((item, index) => `
                    <div class="bg-white p-6 rounded-2xl border border-stone-200 flex justify-between items-center">
                        <div>
                            <h3 class="font-bold text-stone-900">${item.name}</h3>
                            <span class="text-xs text-stone-500">${item.weight}g &bull; ${item.grind}</span>
                        </div>
                        <span class="font-bold text-coffee-950">$${Number(item.price * item.quantity).toLocaleString('es-CO')}</span>
                    </div>
                `).join('')}
                <div class="bg-stone-100 p-6 rounded-2xl flex justify-between items-center">
                    <span class="font-bold">Total:</span>
                    <span class="font-serif text-2xl font-bold text-coffee-950">$${Number(total).toLocaleString('es-CO')} COP</span>
                </div>
                <a href="/checkout" class="block w-full text-center bg-coffee-900 text-white py-4 rounded-xl font-bold uppercase hover:bg-amber-600">Continuar al Checkout</a>
            </div>
        `}
    </div>
  `;
  return render(c, 'Carrito', content);
});

// 5. Agregar al Carrito
app.post('/carrito/agregar', async (c) => {
  const body = await c.req.parseBody();
  const res = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(body.productId).first();
  if (res) {
    const session = getSession(c);
    const weight = parseInt(body.weight) || 250;
    let price = res.price;
    if (weight === 500) price *= 1.9;
    if (weight === 1000) price *= 3.6;

    session.cart.push({
      id: res.id,
      name: res.name,
      weight,
      grind: body.grind,
      price,
      quantity: 1
    });
    session.flash = { success: `¡Añadiste "${res.name}" al carrito!` };
    saveSession(c, session);
  }
  return c.redirect('/carrito');
});

// 6. Checkout
app.get('/checkout', (c) => {
  const session = getSession(c);
  const cart = session.cart || [];
  if (cart.length === 0) return c.redirect('/tienda');
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const content = `
    <div class="py-12 max-w-3xl mx-auto px-4">
        <h1 class="font-serif text-3xl font-bold mb-6">Finalizar Pedido</h1>
        <form action="/checkout" method="POST" class="bg-white p-8 rounded-3xl border border-stone-200 space-y-4">
            <input type="text" name="name" required placeholder="Nombre Completo" class="w-full border p-3 rounded-xl text-sm">
            <input type="email" name="email" required placeholder="Correo Electrónico" class="w-full border p-3 rounded-xl text-sm">
            <input type="tel" name="phone" required placeholder="Teléfono" class="w-full border p-3 rounded-xl text-sm">
            <input type="text" name="address" required placeholder="Dirección de Entrega" class="w-full border p-3 rounded-xl text-sm">
            <div class="pt-4 border-t flex justify-between items-center">
                <span class="font-bold">Total a Pagar:</span>
                <span class="font-serif text-2xl font-bold text-coffee-950">$${Number(total).toLocaleString('es-CO')}</span>
            </div>
            <button type="submit" class="w-full bg-coffee-900 text-white font-bold py-4 rounded-xl uppercase hover:bg-amber-600">Confirmar Pedido</button>
        </form>
    </div>
  `;
  return render(c, 'Checkout', content);
});

// 7. Procesar Checkout en D1
app.post('/checkout', async (c) => {
  const body = await c.req.parseBody();
  const session = getSession(c);
  const cart = session.cart || [];
  if (cart.length === 0) return c.redirect('/tienda');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const orderRes = await c.env.DB.prepare(`
    INSERT INTO orders (customer_name, customer_email, shipping_address, phone, total, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).bind(body.name, body.email, body.address, body.phone, total).run();

  session.cart = [];
  session.flash = { success: '¡Tu pedido fue recibido con éxito en la finca!' };
  saveSession(c, session);

  const content = `
    <div class="py-16 max-w-xl mx-auto text-center px-4">
        <div class="bg-white p-10 rounded-3xl border border-stone-200 shadow-xl space-y-4">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
                <i class="fa-solid fa-check"></i>
            </div>
            <h1 class="font-serif text-3xl font-bold">¡Pedido Confirmado!</h1>
            <p class="text-xs text-stone-500">Destinatario: ${body.name} &bull; Total: $${Number(total).toLocaleString('es-CO')} COP</p>
            <a href="/tienda" class="inline-block bg-coffee-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase">Volver al Catálogo</a>
        </div>
    </div>
  `;
  return render(c, 'Pedido Exitoso', content);
});

// 8. Autenticación y Cuentas
app.get('/login', (c) => {
  const session = getSession(c);
  if (session.user) return c.redirect('/cuenta');

  const content = `
    <div class="py-16 max-w-md mx-auto px-4">
        <div class="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
            <div class="text-center">
                <div class="w-12 h-12 bg-coffee-900 rounded-full flex items-center justify-center text-amber-400 text-xl mx-auto mb-3">
                    <i class="fa-solid fa-mug-hot"></i>
                </div>
                <h1 class="font-serif text-2xl font-bold text-stone-900">Iniciar Sesión</h1>
                <p class="text-xs text-stone-500 mt-1">Accede a tus pedidos y microlotes reservados</p>
            </div>
            <form action="/login" method="POST" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Correo Electrónico</label>
                    <input type="email" name="email" required placeholder="tu@correo.com" class="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-coffee-800 focus:outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Contraseña</label>
                    <input type="password" name="password" required placeholder="••••••••" class="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-coffee-800 focus:outline-none">
                </div>
                <button type="submit" class="w-full bg-coffee-900 hover:bg-amber-600 hover:text-stone-950 text-white font-bold py-3.5 rounded-xl shadow-md transition text-sm">
                    Ingresar a mi cuenta
                </button>
            </form>
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900">
                <strong>Credenciales Admin Finca:</strong><br>
                Email: <code class="font-bold">admin@fincacafe.com</code> &bull; Pass: <code class="font-bold">admin123</code>
            </div>
            <div class="text-center text-xs text-stone-500">
                ¿No tienes cuenta todavía?
                <a href="/registro" class="text-coffee-800 font-bold hover:underline">Regístrate aquí</a>
            </div>
        </div>
    </div>
  `;
  return render(c, 'Iniciar Sesión', content);
});

app.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const session = getSession(c);

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(body.email).first();

  // Verificación básica para Workers
  if (!user || (body.password !== 'admin123' && !user.password_hash)) {
    session.flash = { error: 'Correo o contraseña incorrectos.' };
    saveSession(c, session);
    return c.redirect('/login');
  }

  session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  session.flash = { success: `¡Bienvenido de nuevo, ${user.name}!` };
  saveSession(c, session);

  return c.redirect(user.role === 'admin' ? '/admin' : '/cuenta');
});

app.get('/registro', (c) => {
  const session = getSession(c);
  if (session.user) return c.redirect('/cuenta');

  const content = `
    <div class="py-16 max-w-md mx-auto px-4">
        <div class="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
            <div class="text-center">
                <div class="w-12 h-12 bg-origin-700 rounded-full flex items-center justify-center text-amber-300 text-xl mx-auto mb-3">
                    <i class="fa-solid fa-seedling"></i>
                </div>
                <h1 class="font-serif text-2xl font-bold text-stone-900">Crear Cuenta</h1>
                <p class="text-xs text-stone-500 mt-1">Únete a nuestra comunidad de amantes del café</p>
            </div>
            <form action="/registro" method="POST" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Nombre Completo</label>
                    <input type="text" name="name" required placeholder="Ej. Camila Morales" class="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-coffee-800 focus:outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Correo Electrónico</label>
                    <input type="email" name="email" required placeholder="tu@correo.com" class="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-coffee-800 focus:outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Contraseña</label>
                    <input type="password" name="password" required placeholder="Mínimo 6 caracteres" class="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-coffee-800 focus:outline-none">
                </div>
                <button type="submit" class="w-full bg-coffee-900 hover:bg-amber-600 hover:text-stone-950 text-white font-bold py-3.5 rounded-xl shadow-md transition text-sm">
                    Completar Registro
                </button>
            </form>
            <div class="text-center text-xs text-stone-500">
                ¿Ya tienes una cuenta registrada?
                <a href="/login" class="text-coffee-800 font-bold hover:underline">Inicia sesión</a>
            </div>
        </div>
    </div>
  `;
  return render(c, 'Crear Cuenta', content);
});

app.post('/registro', async (c) => {
  const body = await c.req.parseBody();
  const session = getSession(c);

  if (!body.name || !body.email || !body.password) {
    session.flash = { error: 'Por favor completa todos los campos requeridos.' };
    saveSession(c, session);
    return c.redirect('/registro');
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first();
  if (existing) {
    session.flash = { error: 'Ya existe una cuenta con este correo.' };
    saveSession(c, session);
    return c.redirect('/registro');
  }

  const res = await c.env.DB.prepare(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, 'customer')
  `).bind(body.name, body.email, body.password).run();

  session.user = {
    id: res.meta.last_row_id,
    name: body.name,
    email: body.email,
    role: 'customer'
  };
  session.flash = { success: '¡Cuenta creada con éxito!' };
  saveSession(c, session);

  return c.redirect('/cuenta');
});

app.get('/logout', (c) => {
  const session = getSession(c);
  session.user = null;
  saveSession(c, session);
  return c.redirect('/');
});

app.get('/cuenta', async (c) => {
  const session = getSession(c);
  if (!session.user) return c.redirect('/login');

  let orders = [];
  try {
    const ordersRes = await c.env.DB.prepare('SELECT * FROM orders WHERE customer_email = ? OR user_id = ? ORDER BY id DESC')
      .bind(session.user.email, session.user.id).all();
    orders = ordersRes.results || [];
  } catch (e) {
    console.error('Error orders:', e);
  }

  const content = `
    <div class="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-stone-200 mb-8 gap-4">
            <div>
                <span class="text-xs font-bold text-amber-700 uppercase tracking-widest">Mi Perfil</span>
                <h1 class="font-serif text-3xl font-bold text-stone-900 mt-1">Hola, ${session.user.name}</h1>
                <p class="text-xs text-stone-500">${session.user.email}</p>
            </div>
            <div class="flex items-center gap-3">
                ${session.user.role === 'admin' ? `
                    <a href="/admin" class="bg-amber-600 text-stone-950 font-bold text-xs uppercase px-4 py-2.5 rounded-full">
                        <i class="fa-solid fa-lock"></i> Panel Administrador
                    </a>
                ` : ''}
                <a href="/logout" class="bg-stone-200 text-stone-700 font-bold text-xs uppercase px-4 py-2.5 rounded-full">
                    Cerrar Sesión
                </a>
            </div>
        </div>

        <h2 class="font-serif text-2xl font-bold text-stone-900 mb-6">Historial de Pedidos</h2>
        ${orders.length === 0 ? `
            <div class="bg-white p-8 text-center rounded-3xl border border-stone-200">
                <p class="text-stone-500 text-sm mb-4">Aún no has realizado pedidos de café.</p>
                <a href="/tienda" class="bg-coffee-900 text-white font-bold text-xs uppercase px-6 py-3 rounded-full">Ver Cafés</a>
            </div>
        ` : `
            <div class="space-y-4">
                ${orders.map(o => `
                    <div class="bg-white p-6 rounded-3xl border border-stone-200 flex justify-between items-center">
                        <div>
                            <span class="font-bold text-base text-stone-900">Pedido #${o.id}</span>
                            <span class="text-xs text-stone-400 block">${o.shipping_address} &bull; Tel: ${o.phone}</span>
                        </div>
                        <div class="text-right">
                            <span class="font-serif font-bold text-lg text-coffee-950 block">$${Number(o.total).toLocaleString('es-CO')} COP</span>
                            <span class="bg-amber-100 text-amber-900 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">${o.status}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    </div>
  `;
  return render(c, 'Mi Cuenta', content);
});

// 9. Panel Admin
app.get('/admin', async (c) => {
  const session = getSession(c);
  if (!session.user || session.user.role !== 'admin') {
    session.flash = { error: 'Acceso restringido para administradores.' };
    saveSession(c, session);
    return c.redirect('/login');
  }

  const ordersRes = await c.env.DB.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const productsRes = await c.env.DB.prepare('SELECT * FROM products ORDER BY id DESC').all();
  const orders = ordersRes.results || [];
  const products = productsRes.results || [];
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

  const content = `
    <div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center pb-6 border-b border-stone-200 mb-8">
            <div>
                <span class="text-xs font-bold text-amber-700 uppercase tracking-widest">Panel de Administración</span>
                <h1 class="font-serif text-3xl font-bold text-stone-900 mt-1">Gestión de la Finca & Pedidos</h1>
            </div>
            <a href="/admin/productos/nuevo" class="bg-coffee-900 text-white font-bold text-xs uppercase px-5 py-3 rounded-full hover:bg-amber-600">
                + Nuevo Lote
            </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div class="bg-white p-6 rounded-3xl border border-stone-200">
                <span class="text-xs font-bold text-stone-400 uppercase">Ventas Totales</span>
                <span class="font-serif text-3xl font-bold text-coffee-950 mt-1 block">$${Number(totalSales).toLocaleString('es-CO')}</span>
            </div>
            <div class="bg-white p-6 rounded-3xl border border-stone-200">
                <span class="text-xs font-bold text-stone-400 uppercase">Pedidos</span>
                <span class="font-serif text-3xl font-bold text-amber-700 mt-1 block">${orders.length}</span>
            </div>
            <div class="bg-white p-6 rounded-3xl border border-stone-200">
                <span class="text-xs font-bold text-stone-400 uppercase">Lotes Activos</span>
                <span class="font-serif text-3xl font-bold text-origin-700 mt-1 block">${products.length}</span>
            </div>
        </div>

        <div class="bg-white rounded-3xl border border-stone-200 overflow-hidden mb-12">
            <div class="p-6 border-b border-stone-200"><h3 class="font-serif font-bold text-lg">Pedidos Recientes</h3></div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-stone-50 border-b text-stone-500 uppercase">
                        <tr>
                            <th class="p-4"># ID</th>
                            <th class="p-4">Cliente</th>
                            <th class="p-4">Dirección</th>
                            <th class="p-4">Total</th>
                            <th class="p-4">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-100">
                        ${orders.map(o => `
                            <tr>
                                <td class="p-4 font-bold text-coffee-900">#${o.id}</td>
                                <td class="p-4"><strong>${o.customer_name}</strong><br><span class="text-stone-400">${o.customer_email}</span></td>
                                <td class="p-4">${o.shipping_address}<br><span class="text-stone-400">Tel: ${o.phone}</span></td>
                                <td class="p-4 font-bold">$${Number(o.total).toLocaleString('es-CO')}</td>
                                <td class="p-4"><span class="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full uppercase text-[10px]">${o.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `;
  return render(c, 'Panel Admin', content);
});

// 10. Vistas de Origen, Métodos, Suscripciones y Mayoristas
app.get('/origen', (c) => render(c, 'Nuestra Finca', '<div class="py-16 max-w-4xl mx-auto px-4"><h1 class="font-serif text-4xl font-bold mb-4">Finca Los Andes</h1><p class="text-stone-600 leading-relaxed">Cultivamos café de especialidad a 1,850 metros de altitud bajo sombra natural en la cordillera central colombiana.</p></div>'));
app.get('/metodos', (c) => render(c, 'Guías Barista', '<div class="py-16 max-w-4xl mx-auto px-4"><h1 class="font-serif text-4xl font-bold mb-4">Métodos de Preparación</h1><p class="text-stone-600">Recetas calibradas para V60, Prensa Francesa y Aeropress.</p></div>'));
app.get('/suscripciones', (c) => render(c, 'Suscripciones', '<div class="py-16 max-w-4xl mx-auto px-4"><h1 class="font-serif text-4xl font-bold mb-4">Club de Suscripción</h1><p class="text-stone-600">Recibe café recién tostado quincenal o mensualmente.</p></div>'));
app.get('/mayoristas', (c) => render(c, 'Mayoristas', '<div class="py-16 max-w-4xl mx-auto px-4"><h1 class="font-serif text-4xl font-bold mb-4">Café para Cafeterías & Empresas</h1><p class="text-stone-600">Ventas al por mayor y microlotes en sacos verdes.</p></div>'));

export default app;
