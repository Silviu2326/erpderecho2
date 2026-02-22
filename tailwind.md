# Guía Completa de Tailwind CSS

## ¿Qué es Tailwind CSS?

Tailwind CSS es un framework de utilidades CSS de bajo nivel que permite construir interfaces personalizadas sin salir del HTML. En lugar de predefinir componentes, Tailwind proporciona clases utilitarias que aplicas directamente en el markup.

### Características Principales

- **Utility-First**: Clases pequeñas y reutilizables para cada propiedad CSS
- **Responsive Design**: Diseños adaptativos con prefixos simples
- **State Variants**: Estados como hover, focus, active con modificadores
- **Dark Mode**: Soporte integrado para modo oscuro
- **Purge CSS**: Elimina clases no usadas en producción

---

## Instalación

### Con Vite

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configuración (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### Directivas CSS

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Sistema de Diseño

### Colores

Tailwind incluye una paleta de colores por defecto:

```html
<!-- Colores base -->
<div class="bg-red-50">bg-red-50</div>
<div class="bg-red-100">...</div>
<div class="bg-red-200">...</div>
<!-- ... hasta bg-red-900 -->

<!-- Opacidad con slash -->
<div class="bg-red-500/50">Rojo con 50% opacidad</div>

<!-- Colores con variables -->
<div class="bg-[#3b82f6]">Color personalizado</div>
```

**Escala de colores disponible**: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, gray, zinc, neutral, stone

### Espaciado

```html
<!-- Padding -->
<p class="p-0">p-0</p>
<p class="p-1">p-1 (0.25rem = 4px)</p>
<p class="p-2">p-2 (0.5rem = 8px)</p>
<!-- ... hasta p-96 (24rem = 384px) -->

<!-- Padding específico -->
<div class="pt-4">pt (padding-top)</div>
<div class="pb-4">pb (padding-bottom)</div>
<div class="pl-4">pl (padding-left)</div>
<div class="pr-4">pr (padding-right)</div>
<div class="px-4">px (eje X)</div>
<div class="py-4">py (eje Y)</div>

<!-- Margin (mismo patrón) -->
<div class="m-4">m-4</div>
<div class="mx-auto">mx-auto (centrar)</div>
<div class="-mt-4">-mt (negativo)</div>
```

### Tipografía

```html
<!-- Tamaño de fuente -->
<p class="text-xs">text-xs (0.75rem)</p>
<p class="text-sm">text-sm (0.875rem)</p>
<p class="text-base">text-base (1rem)</p>
<p class="text-lg">text-lg (1.125rem)</p>
<p class="text-xl">text-xl (1.25rem)</p>
<p class="text-2xl">text-2xl (1.5rem)</p>
<!-- ... hasta text-9xl -->

<!-- Peso de fuente -->
<p class="font-thin">font-thin</p>
<p class="font-extralight">font-extralight</p>
<p class="font-light">font-light</p>
<p class="font-normal">font-normal</p>
<p class="font-medium">font-medium</p>
<p class="font-semibold">font-semibold</p>
<p class="font-bold">font-bold</p>
<p class="font-extrabold">font-extrabold</p>

<!-- Estilo -->
<p class="italic">italic</p>
<p class="not-italic">not-italic</p>

<!-- Transformación -->
<p class="uppercase">uppercase</p>
<p class="lowercase">lowercase</p>
<p class="capitalize">capitalize</p>
<p class="normal-case">normal-case</p>

<!-- Decoración -->
<p class="underline">underline</p>
<p class="overline">overline</p>
<p class="line-through">line-through</p>
<p class="no-underline">no-underline</p>

<!-- Alineación -->
<p class="text-left">text-left</p>
<p class="text-center">text-center</p>
<p class="text-right">text-right</p>
<p class="text-justify">text-justify</p>

<!-- Interlineado -->
<p class="leading-none">leading-none</p>
<p class="leading-tight">leading-tight</p>
<p class="leading-normal">leading-normal</p>
<p class="leading-loose">leading-loose</p>

<!-- Tracking (letter-spacing) -->
<p class="tracking-tighter">tracking-tighter</p>
<p class="tracking-tight">tracking-tight</p>
<p class="tracking-normal">tracking-normal</p>
<p class="tracking-wide">tracking-wide</p>
<p class="tracking-wider">tracking-wider</p>
<p class="tracking-widest">tracking-widest</p>
```

### Ancho y Alto

```html
<!-- Ancho -->
<div class="w-0">w-0</div>
<div class="w-1">w-1 (4px)</div>
<div class="w-full">w-full (100%)</div>
<div class="w-screen">w-screen (100vw)</div>
<div class="w-auto">w-auto</div>
<div class="w-1/2">w-1/2 (50%)</div>
<div class="w-3/4">w-3/4 (75%)</div>
<div class="w-[200px]">w-[200px] (custom)</div>

<!-- Alto -->
<div class="h-full">h-full</div>
<div class="h-screen">h-screen</div>
<div class="h-[300px]">h-[300px]</div>

<!-- Min/Max -->
<div class="min-h-screen">min-h-screen</div>
<div class="max-w-md">max-w-md</div>
<div class="max-w-lg">max-w-lg</div>
<div class="max-w-xl">max-w-xl</div>
<div class="max-w-2xl">max-w-2xl</div>
<div class="max-w-4xl">max-w-4xl</div>
<div class="max-w-full">max-w-full</div>
```

---

## Layout

### Display

```html
<div class="block">block</div>
<div class="inline-block">inline-block</div>
<div class="inline">inline</div>
<div class="flex">flex</div>
<div class="inline-flex">inline-flex</div>
<div class="grid">grid</div>
<div class="inline-grid">inline-grid</div>
<div class="hidden">hidden</div>
```

### Flexbox

```html
<!-- Contenedor -->
<div class="flex">flex</div>
<div class="flex-row">flex-row (default)</div>
<div class="flex-row-reverse">flex-row-reverse</div>
<div class="flex-col">flex-col</div>
<div class="flex-col-reverse">flex-col-reverse</div>

<!-- Wrapping -->
<div class="flex-nowrap">flex-nowrap</div>
<div class="flex-wrap">flex-wrap</div>
<div class="flex-wrap-reverse">flex-wrap-reverse</div>

<!-- Justify -->
<div class="justify-start">justify-start</div>
<div class="justify-end">justify-end</div>
<div class="justify-center">justify-center</div>
<div class="justify-between">justify-between</div>
<div class="justify-around">justify-around</div>
<div class="justify-evenly">justify-evenly</div>

<!-- Align items -->
<div class="items-start">items-start</div>
<div class="items-end">items-end</div>
<div class="items-center">items-center</div>
<div class="items-stretch">items-stretch</div>

<!-- Gap -->
<div class="gap-4">gap-4 (16px)</div>
<div class="gap-x-4">gap-x-4</div>
<div class="gap-y-4">gap-y-4</div>

<!-- Items individuales -->
<div class="flex-1">flex-1</div>
<div class="flex-auto">flex-auto</div>
<div class="flex-none">flex-none</div>
<div class="order-1">order-1</div>
<div class="order-first">order-first</div>
<div class="order-last">order-last</div>
```

### Grid

```html
<!-- Grid básico -->
<div class="grid grid-cols-2">2 columnas</div>
<div class="grid grid-cols-3">3 columnas</div>
<div class="grid grid-cols-4">4 columnas</div>
<div class="grid grid-cols-6">6 columnas</div>
<div class="grid grid-cols-12">12 columnas</div>

<!-- Spanning -->
<div class="col-span-2">col-span-2</div>
<div class="col-span-full">col-span-full</div>
<div class="row-span-2">row-span-2</div>

<!-- Start/End -->
<div class="col-start-1">col-start-1</div>
<div class="col-end-3">col-end-3</div>

<!-- Gap -->
<div class="gap-4">gap-4</div>
<div class="gap-x-4">gap-x-4</div>
<div class="gap-y-4">gap-y-4</div>
```

### Position

```html
<div class="static">static</div>
<div class="relative">relative</div>
<div class="absolute">absolute</div>
<div class="fixed">fixed</div>
<div class="sticky">sticky</div>

<!-- Offsets -->
<div class="top-0">top-0</div>
<div class="right-0">right-0</div>
<div class="bottom-0">bottom-0</div>
<div class="left-0">left-0</div>
<div class="inset-0">inset-0</div>
```

---

## Responsive Design

### Breakpoints

| Prefix | Min Width |
|--------|-----------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

### Uso

```html
<!-- Mobile first: se aplica siempre, cambia en breakpoints -->
<div class="block md:flex lg:grid">

<!-- Ejemplo práctico -->
<button class="
  w-full md:w-auto 
  bg-blue-500 hover:bg-blue-600 
  px-4 py-2 rounded
  md:rounded-lg
">
  Botón
</button>
```

---

## Estados (Variants)

### Hover

```html
<button class="hover:bg-blue-600">hover:bg-blue-600</button>
<div class="hover:text-red-500">hover:text-red-500</div>
<div class="hover:opacity-75">hover:opacity-75</div>
```

### Focus

```html
<input class="focus:outline-none focus:ring-2 focus:ring-blue-500" />
<input class="focus:border-blue-500" />
<div class="focus-within:bg-gray-100">focus-within:bg-gray-100</div>
```

### Active

```html
<button class="active:bg-blue-700">active:bg-blue-700</button>
```

### Disabled

```html
<button class="disabled:opacity-50 disabled:cursor-not-allowed">
```

### Group Hover

```html
<div class="group hover:bg-blue-500">
  <p class="group-hover:text-white">Texto cambia al hacer hover en el padre</p>
</div>
```

### Peer

```html
<input type="checkbox" class="peer" />
<p class="peer-checked:text-blue-500">Cambia cuando el checkbox está marcado</p>
```

---

## Efectos Visuales

### Sombras

```html
<div class="shadow-sm">shadow-sm</div>
<div class="shadow">shadow</div>
<div class="shadow-md">shadow-md</div>
<div class="shadow-lg">shadow-lg</div>
<div class="shadow-xl">shadow-xl</div>
<div class="shadow-2xl">shadow-2xl</div>
<div class="shadow-inner">shadow-inner</div>
<div class="shadow-none">shadow-none</div>
```

### Opacidad

```html
<div class="opacity-0">opacity-0</div>
<div class="opacity-25">opacity-25</div>
<div class="opacity-50">opacity-50</div>
<div class="opacity-75">opacity-75</div>
<div class="opacity-100">opacity-100</div>
```

### Bordes

```html
<!-- Ancho -->
<div class="border">border</div>
<div class="border-2">border-2</div>
<div class="border-4">border-4</div>
<div class="border-8">border-8</div>
<div class="border-0">border-0</div>

<!-- Color -->
<div class="border-gray-300">border-gray-300</div>
<div class="border-red-500">border-red-500</div>

<!-- Estilo -->
<div class="border-solid">border-solid</div>
<div class="border-dashed">border-dashed</div>
<div class="border-dotted">border-dotted</div>
<div class="border-double">border-double</div>
<div class="border-none">border-none</div>

<!-- Radius -->
<div class="rounded">rounded</div>
<div class="rounded-sm">rounded-sm</div>
<div class="rounded-md">rounded-md</div>
<div class="rounded-lg">rounded-lg</div>
<div class="rounded-xl">rounded-xl</div>
<div class="rounded-2xl">rounded-2xl</div>
<div class="rounded-full">rounded-full</div>

<!-- Lados específicos -->
<div class="rounded-t-lg">rounded-t-lg</div>
<div class="rounded-b-lg">rounded-b-lg</div>
<div class="rounded-l-lg">rounded-l-lg</div>
<div class="rounded-r-lg">rounded-r-lg</div>
```

### Gradients

```html
<!-- Dirección -->
<div class="bg-gradient-to-r">bg-gradient-to-r</div>
<div class="bg-gradient-to-l">bg-gradient-to-l</div>
<div class="bg-gradient-to-t">bg-gradient-to-t</div>
<div class="bg-gradient-to-b">bg-gradient-to-b</div>
<div class="bg-gradient-to-tr">bg-gradient-to-tr</div>
<div class="bg-gradient-to-tl">bg-gradient-to-tl</div>
<div class="bg-gradient-to-br">bg-gradient-to-br</div>
<div class="bg-gradient-to-bl">bg-gradient-to-bl</div>

<!-- Ejemplo completo -->
<div class="bg-gradient-to-r from-blue-500 to-purple-600">
  Gradiente horizontal
</div>
<div class="bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600">
  Gradiente con stop intermedio
</div>
```

### Transiciones

```html
<!-- Duración -->
<div class="duration-75">duration-75</div>
<div class="duration-100">duration-100</div>
<div class="duration-200">duration-200</div>
<div class="duration-300">duration-300</div>
<div class="duration-500">duration-500</div>
<div class="duration-700">duration-700</div>
<div class="duration-1000">duration-1000</div>

<!-- Timing -->
<div class="ease-linear">ease-linear</div>
<div class="ease-in">ease-in</div>
<div class="ease-out">ease-out</div>
<div class="ease-in-out">ease-in-out</div>

<!-- Property -->
<div class="transition-none">transition-none</div>
<div class="transition-all">transition-all</div>
<div class="transition-colors">transition-colors</div>
<div class="transition-opacity">transition-opacity</div>
<div class="transition-transform">transition-transform</div>

<!-- Ejemplo completo -->
<button class="
  bg-blue-500 
  hover:bg-blue-600 
  transition-colors duration-300
">
  Botón con transición
</button>
```

### Transform

```html
<!-- Escala -->
<div class="scale-0">scale-0</div>
<div class="scale-50">scale-50</div>
<div class="scale-75">scale-75</div>
<div class="scale-90">scale-90</div>
<div class="scale-95">scale-95</div>
<div class="scale-100">scale-100</div>
<div class="scale-105">scale-105</div>
<div class="scale-110">scale-110</div>
<div class="scale-125">scale-125</div>

<!-- Rotate -->
<div class="rotate-0">rotate-0</div>
<div class="rotate-45">rotate-45</div>
<div class="rotate-90">rotate-90</div>
<div class="rotate-180">rotate-180</div>
<div class="-rotate-45">-rotate-45</div>

<!-- Translate -->
<div class="translate-x-0">translate-x-0</div>
<div class="translate-x-4">translate-x-4</div>
<div class="-translate-x-4">-translate-x-4</div>

<!-- Ejemplo hover -->
<button class="
  hover:scale-105 
  hover:rotate-3 
  transition-transform duration-300
">
  Efecto hover
</button>
```

### Animaciones

```html
<!-- Animaciones predefinidas -->
<div class="animate-spin">animate-spin</div>
<div class="animate-ping">animate-ping</div>
<div class="animate-pulse">animate-pulse</div>
<div class="animate-bounce">animate-bounce</div>

<!-- Animación personalizada -->
<div class="animate-[spin_3s_linear_infinite]">
  Animación custom
</div>
```

---

## Interactividad

### Overflow

```html
<div class="overflow-auto">overflow-auto</div>
<div class="overflow-hidden">overflow-hidden</div>
<div class="overflow-visible">overflow-visible</div>
<div class="overflow-scroll">overflow-scroll</div>
<div class="overflow-x-auto">overflow-x-auto</div>
<div class="overflow-y-auto">overflow-y-auto</div>
```

### Cursor

```html
<button class="cursor-pointer">cursor-pointer</button>
<button class="cursor-default">cursor-default</button>
<button class="cursor-not-allowed">cursor-not-allowed</button>
<button class="cursor-wait">cursor-wait</button>
<button class="cursor-help">cursor-help</button>
<button class="cursor-move">cursor-move</button>
```

### User Select

```html
<p class="select-none">select-none</p>
<p class="select-text">select-text</p>
<p class="select-all">select-all</p>
<p class="select-auto">select-auto</p>
```

### Visibility

```html
<div class="visible">visible</div>
<div class="invisible">invisible</div>
```

---

## Componentes Comunes

### Botón

```html
<!-- Primario -->
<button class="
  bg-blue-600 
  hover:bg-blue-700 
  text-white 
  font-medium 
  py-2 
  px-4 
  rounded-lg 
  transition-colors
">
  Botón
</button>

<!-- Secundario -->
<button class="
  bg-gray-200 
  hover:bg-gray-300 
  text-gray-800 
  font-medium 
  py-2 
  px-4 
  rounded-lg
">
  Secundario
</button>

<!-- Outline -->
<button class="
  border-2 
  border-blue-600 
  text-blue-600 
  hover:bg-blue-600 
  hover:text-white
  font-medium 
  py-2 
  px-4 
  rounded-lg
  transition-colors
">
  Outline
</button>

<!-- Grande -->
<button class="
  bg-blue-600 
  text-white 
  font-semibold 
  py-3 
  px-6 
  text-lg 
  rounded-xl
">
  Grande
</button>

<!-- Pequeño -->
<button class="
  bg-blue-600 
  text-white 
  font-medium 
  py-1 
  px-3 
  text-sm 
  rounded
">
  Pequeño
</button>

<!-- Disabled -->
<button 
  class="
    bg-blue-600 
    text-white 
    font-medium 
    py-2 
    px-4 
    rounded-lg
    opacity-50 
    cursor-not-allowed
  "
  disabled
>
  Disabled
</button>
```

### Input

```html
<!-- Básico -->
<input 
  type="text" 
  class="
    border 
    border-gray-300 
    rounded-lg 
    px-4 
    py-2 
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500 
    focus:border-transparent
  "
  placeholder="Escribe algo..."
/>

<!-- Con icono -->
<div class="relative">
  <input 
    type="text" 
    class="
      border 
      border-gray-300 
      rounded-lg 
      pl-10 
      pr-4 
      py-2 
      w-full
    "
    placeholder="Buscar..."
  />
  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
    <!-- Icono -->
  </svg>
</div>

<!-- Textarea -->
<textarea 
  class="
    border 
    border-gray-300 
    rounded-lg 
    px-4 
    py-2 
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500 
    resize-none
  " 
  rows="4"
></textarea>
```

### Card

```html
<div class="
  bg-white 
  rounded-xl 
  shadow-md 
  overflow-hidden
">
  <div class="h-48 bg-gray-200">
    <!-- Imagen -->
  </div>
  <div class="p-6">
    <h3 class="text-xl font-semibold text-gray-900 mb-2">
      Título
    </h3>
    <p class="text-gray-600">
      Descripción del card...
    </p>
    <div class="mt-4 flex justify-end">
      <button class="text-blue-600 hover:text-blue-700 font-medium">
        Leer más
      </button>
    </div>
  </div>
</div>
```

### Navbar

```html
<nav class="bg-white shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Logo -->
      <div class="flex-shrink-0 flex items-center">
        <span class="text-xl font-bold text-blue-600">Logo</span>
      </div>
      
      <!-- Links (desktop) -->
      <div class="hidden md:flex space-x-8 items-center">
        <a href="#" class="text-gray-600 hover:text-gray-900">Inicio</a>
        <a href="#" class="text-gray-600 hover:text-gray-900">Acerca</a>
        <a href="#" class="text-gray-600 hover:text-gray-900">Contacto</a>
      </div>
      
      <!-- Mobile menu button -->
      <div class="flex items-center md:hidden">
        <button class="text-gray-600 hover:text-gray-900">
          <!-- Icono menu -->
        </button>
      </div>
    </div>
  </div>
</nav>
```

### Modal

```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <!-- Modal -->
  <div class="
    bg-white 
    rounded-xl 
    shadow-xl 
    max-w-md 
    w-full 
    mx-4
  ">
    <!-- Header -->
    <div class="flex justify-between items-center p-4 border-b">
      <h3 class="text-lg font-semibold">Título</h3>
      <button class="text-gray-400 hover:text-gray-600">
        X
      </button>
    </div>
    
    <!-- Body -->
    <div class="p-4">
      <p>Contenido del modal...</p>
    </div>
    
    <!-- Footer -->
    <div class="flex justify-end gap-2 p-4 border-t">
      <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
        Cancelar
      </button>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Aceptar
      </button>
    </div>
  </div>
</div>
```

### Dropdown

```html
<div class="relative inline-block">
  <button class="
    bg-white 
    border 
    border-gray-300 
    rounded-lg 
    px-4 
    py-2 
    flex 
    items-center 
    gap-2
  ">
    Menú
    <svg class="w-4 h-4">▼</svg>
  </button>
  
  <div class="
    absolute 
    mt-2 
    w-48 
    bg-white 
    border 
    border-gray-200 
    rounded-lg 
    shadow-lg 
    hidden
  ">
    <a href="#" class="block px-4 py-2 hover:bg-gray-100">
      Opción 1
    </a>
    <a href="#" class="block px-4 py-2 hover:bg-gray-100">
      Opción 2
    </a>
    <a href="#" class="block px-4 py-2 hover:bg-gray-100">
      Opción 3
    </a>
  </div>
</div>
```

### Badge / Tag

```html
<!-- Principal -->
<span class="
  bg-blue-100 
  text-blue-800 
  text-xs 
  font-medium 
  px-2.5 
  py-0.5 
  rounded
">
  Nuevo
</span>

<!-- Éxito -->
<span class="
  bg-green-100 
  text-green-800 
  text-xs 
  font-medium 
  px-2.5 
  py-0.5 
  rounded
">
  Activo
</span>

<!-- Warning -->
<span class="
  bg-yellow-100 
  text-yellow-800 
  text-xs 
  font-medium 
  px-2.5 
  py-0.5 
  rounded
">
  Pendiente
</span>

<!-- Error -->
<span class="
  bg-red-100 
  text-red-800 
  text-xs 
  font-medium 
  px-2.5 
  py-0.5 
  rounded
">
  Error
</span>
```

### Alert

```html
<!-- Info -->
<div class="
  bg-blue-50 
  border-l-4 
  border-blue-500 
  p-4
">
  <p class="text-blue-700">Información importante.</p>
</div>

<!-- Success -->
<div class="
  bg-green-50 
  border-l-4 
  border-green-500 
  p-4
">
  <p class="text-green-700">Operación exitosa.</p>
</div>

<!-- Warning -->
<div class="
  bg-yellow-50 
  border-l-4 
  border-yellow-500 
  p-4
">
  <p class="text-yellow-700">Advertencia.</p>
</div>

<!-- Error -->
<div class="
  bg-red-50 
  border-l-4 
  border-red-500 
  p-4
">
  <p class="text-red-700">Error occurred.</p>
</div>
```

---

## Dark Mode

### Configuración

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // o 'media'
  // ...
}
```

### Uso

```html
<!-- Manual con clase -->
<div class="bg-white dark:bg-gray-900">
  <h1 class="text-gray-900 dark:text-white">Título</h1>
</div>

<!-- Sistema -->
<div class="dark:bg-gray-900">
  Se adapta al sistema
</div>
```

---

## @apply y Componentes

### Definir componentes

```css
/* styles.css */
@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-md overflow-hidden;
  }
  
  .input-field {
    @apply border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

### Uso en HTML

```html
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<div class="card">...</div>
<input class="input-field" />
```

---

## Funciones y Directivas

### theme()

```css
.custom-class {
  color: theme('colors.blue.500');
  padding: theme('spacing.4');
}
```

### screen()

```css
@media screen(sm) {
  /* ... */
}
```

### @layer

```css
@layer base {
  /* Estilos base */
  body {
    @apply antialiased;
  }
}

@layer components {
  /* Componentes */
}

@layer utilities {
  /* Utilidades personalizadas */
}
```

---

## Arbitrary Values

### Valores personalizados

```html
<!-- Ancho -->
<div class="w-[200px]">w-[200px]</div>
<div class="w-[calc(100%-2rem)]">w-[calc(100%-2rem)]</div>

<!-- Color -->
<div class="text-[#ff0000]">text-[#ff0000]</div>
<div class="bg-[rgb(255,0,0)]">bg-[rgb(255,0,0)]</div>

<!-- Breakpoints en arbitrary -->
<div class="md:w-[800px]">md:w-[800px]</div>

<!-- Múltiples valores -->
<div class="grid-cols-[1fr,auto,1fr]">grid-cols-[1fr,auto,1fr]</div>
<div class="gap-[10px,20px]">gap-[10px,20px]</div>
```

---

## Mejores Prácticas

1. **Mobile First**: Diseña primero para móvil, luego agrega breakpoints
2. **Utiliza componentes**: Extrae elementos repetidos a componentes
3. **Evita valores hardcoded**: Usa la escala de Tailwind
4. **Agrupa clases**: Mantén un orden consistente (layout, box model, visual, states)
5. **Purge en producción**: Asegúrate de purgar CSS no usado
6. **Extiende el theme**: Define tus colores y spacing en config
7. **Usa clamp()**: Para valores fluidos entre breakpoints

### Orden recomendado de clases

```html
<div class="
  <!-- Layout -->
  flex items-center justify-between
  <!-- Box model -->
  w-full p-4 m-2
  <!-- Visual -->
  bg-white border rounded-lg shadow-md
  <!-- Typography -->
  text-gray-900 font-medium
  <!-- States -->
  hover:bg-gray-100 focus:ring-2
  <!-- Responsive -->
  md:p-6
">
  Contenido
</div>
```

---

## Plugins Útiles

- **@tailwindcss/forms**: Estilos improved para inputs
- **@tailwindcss/typography**: Estilos para contenido HTML (prose)
- **@tailwindcss/aspect-ratio**: Control de aspect-ratio
- **@tailwindcss/line-clamp**: Line clamping para texto

---

## Recursos Adicionales

- [Documentación oficial](https://tailwindcss.com/docs)
- [Playground](https://play.tailwindcss.com)
- [Cheat Sheet](https://tailwindcss.com/cheat-sheet)
- [Heroicons](https://heroicons.com)
- [Headless UI](https://headlessui.com)
