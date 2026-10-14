// Layout principal para Cloudflare Workers
export function layout({ title, user, cartCount = 0, flash = {}, content }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title ? title + ' | ' : ''}Caficultura de Origen & Café de Especialidad</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .bg-coffee-950 { background-color: #1A0E08; }
        .bg-coffee-900 { background-color: #2C1B10; }
        .bg-coffee-800 { background-color: #4A2E1B; }
        .bg-coffee-50 { background-color: #FDF8F5; }
        .text-coffee-950 { color: #1A0E08; }
        .text-coffee-900 { color: #2C1B10; }
        .text-coffee-800 { color: #4A2E1B; }
        .text-coffee-700 { color: #6E4327; }
        .border-coffee-900 { border-color: #2C1B10; }
        .border-coffee-800 { border-color: #4A2E1B; }
        .bg-origin-900 { background-color: #1E3020; }
        .bg-origin-800 { background-color: #1E3020; }
        .bg-origin-700 { background-color: #2C442E; }
        .bg-origin-600 { background-color: #3D5A40; }
        .bg-origin-100 { background-color: #E8EFE9; }
        .bg-origin-50 { background-color: #F4F7F4; }
        .text-origin-700 { color: #2C442E; }
        .text-origin-600 { color: #3D5A40; }
    </style>
</head>
<body class="bg-stone-50 text-stone-800 flex flex-col min-h-screen">
    <div class="bg-coffee-950 text-amber-200/80 text-xs py-2 px-4 text-center tracking-widest uppercase font-medium">
        🌱 Cosecha de Altura • Finca Los Andes (1,850 m.s.n.m.) • Envíos directos de finca a tu mesa
    </div>

    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <a href="/" class="flex items-center gap-3 group">
                    <div class="w-12 h-12 bg-coffee-900 rounded-full flex items-center justify-center text-amber-400 text-xl group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-seedling"></i>
                    </div>
                    <div>
                        <span class="block font-serif text-2xl font-bold tracking-tight text-coffee-950">CAFÉ ORIGEN</span>
                        <span class="block text-[10px] tracking-[0.2em] uppercase text-stone-500 font-semibold">Caficultura & Microlotes</span>
                    </div>
                </a>

                <nav class="hidden md:flex items-center space-x-7 font-medium text-sm text-stone-700">
                    <a href="/" class="hover:text-coffee-700 transition">Inicio</a>
                    <a href="/origen" class="hover:text-coffee-700 transition">Nuestra Finca</a>
                    <a href="/tienda" class="hover:text-coffee-700 transition">Catálogo</a>
                    <a href="/metodos" class="hover:text-coffee-700 transition">Guías Barista</a>
                    <a href="/suscripciones" class="hover:text-coffee-700 transition">Suscripción</a>
                    <a href="/mayoristas" class="hover:text-coffee-700 transition">Mayoristas</a>
                </nav>

                <div class="flex items-center gap-4">
                    ${user ? `
                        <div class="relative group">
                            <a href="/cuenta" class="flex items-center gap-2 text-sm font-semibold text-coffee-900 hover:text-coffee-700 py-2">
                                <i class="fa-regular fa-user text-base"></i>
                                <span class="hidden sm:inline">${user.name.split(' ')[0]}</span>
                                ${user.role === 'admin' ? '<span class="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Admin</span>' : ''}
                            </a>
                        </div>
                        ${user.role === 'admin' ? `
                            <a href="/admin" class="hidden sm:inline-flex items-center gap-1.5 text-xs bg-stone-900 text-white px-3 py-1.5 rounded-md hover:bg-stone-800 transition">
                                <i class="fa-solid fa-gear"></i> Panel
                            </a>
                        ` : ''}
                        <a href="/logout" class="text-xs text-stone-500 hover:text-red-600" title="Cerrar sesión">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        </a>
                    ` : `
                        <a href="/login" class="text-sm font-semibold text-stone-700 hover:text-coffee-800 px-3 py-2">Ingresar</a>
                        <a href="/registro" class="hidden sm:inline-block text-xs uppercase tracking-wider font-bold bg-coffee-800 text-amber-100 px-4 py-2 rounded-full hover:bg-coffee-900 transition">Registrarse</a>
                    `}

                    <a href="/carrito" class="relative bg-stone-100 hover:bg-coffee-50 p-2.5 rounded-full text-coffee-900 transition flex items-center justify-center">
                        <i class="fa-solid fa-bag-shopping text-lg"></i>
                        <span class="absolute -top-1 -right-1 bg-amber-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                            ${cartCount}
                        </span>
                    </a>
                </div>
            </div>
        </div>
    </header>

    ${flash.success ? `
        <div class="max-w-7xl mx-auto px-4 mt-4 w-full">
            <div class="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-r-md text-sm shadow-sm">
                ${flash.success}
            </div>
        </div>
    ` : ''}
    ${flash.error ? `
        <div class="max-w-7xl mx-auto px-4 mt-4 w-full">
            <div class="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-r-md text-sm shadow-sm">
                ${flash.error}
            </div>
        </div>
    ` : ''}

    <main class="flex-grow">
        ${content}
    </main>

    <footer class="bg-coffee-950 text-stone-300 mt-20 border-t border-coffee-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div class="space-y-4">
                    <span class="font-serif text-2xl font-bold tracking-tight text-white block">CAFÉ ORIGEN</span>
                    <p class="text-sm text-stone-400 leading-relaxed">
                        Finca caficultora familiar dedicada a la preservación de variedades exóticas, fermentaciones de precisión y comercio justo directo de origen.
                    </p>
                    <div class="flex items-center space-x-3 text-amber-300">
                        <i class="fa-solid fa-mountain text-sm"></i>
                        <span class="text-xs font-semibold tracking-wider uppercase">1,850 m.s.n.m. • Cordillera Central</span>
                    </div>
                </div>
                <div>
                    <h4 class="font-serif text-lg font-semibold text-white mb-4">Explorar</h4>
                    <ul class="space-y-2.5 text-sm">
                        <li><a href="/tienda" class="hover:text-amber-300 transition">Catálogo de Microlotes</a></li>
                        <li><a href="/origen" class="hover:text-amber-300 transition">Historia y Familia Caficultora</a></li>
                        <li><a href="/metodos" class="hover:text-amber-300 transition">Guías de Preparación</a></li>
                        <li><a href="/suscripciones" class="hover:text-amber-300 transition">Club de Suscripciones</a></li>
                        <li><a href="/mayoristas" class="hover:text-amber-300 transition">Ventas Mayoristas B2B</a></li>
                        <li><a href="/carrito" class="hover:text-amber-300 transition">Carrito de Compras</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-serif text-lg font-semibold text-white mb-4">Garantía SCA</h4>
                    <ul class="space-y-2 text-sm text-stone-400">
                        <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-500 text-xs"></i> Lotes puntuados >86 puntos SCA</li>
                        <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-500 text-xs"></i> Tueste semanal sobre pedido</li>
                        <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-500 text-xs"></i> 100% Trazable hasta el lote</li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-serif text-lg font-semibold text-white mb-4">Contacto Directo</h4>
                    <p class="text-sm text-stone-400 mb-2">Pedidos mayoristas y reservas:</p>
                    <a href="mailto:hola@fincacafeorigen.com" class="text-amber-400 text-sm font-semibold hover:underline block mb-4">hola@fincacafeorigen.com</a>
                </div>
            </div>
            <div class="mt-12 pt-8 border-t border-coffee-900 text-center text-xs text-stone-500">
                &copy; ${new Date().getFullYear()} Café Origen - Finca Caficultora & Café de Especialidad.
            </div>
        </div>
    </footer>
</body>
</html>`;
}
