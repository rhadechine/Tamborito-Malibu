# Tamborito Malibú Cliente

Frontend en React.js convertido desde la maqueta HTML/CSS original del ecosistema cultural **Fundación Tamborito** y **Museo Arqueológico Malibú**.

Esta versión usa **Tailwind CSS** como base de estilos, manteniendo el diseño visual original y dejando el proyecto más limpio para crecer después con Django REST Framework.

## Stack

- React.js
- Vite
- React Router DOM
- Tailwind CSS
- PostCSS
- Autoprefixer

## Configuración ligera aplicada

- Tailwind configurado con `content` para generar solo estilos usados.
- `preflight` desactivado para evitar CSS base innecesario y conservar el diseño original.
- `container` nativo de Tailwind desactivado para mantener el contenedor exacto de la maqueta.
- Rutas con `React.lazy` y `Suspense` para carga diferida por página.
- `vite.config.js` con separación de chunks para React, router y páginas.
- No incluye `node_modules` ni `dist` dentro del ZIP.
- Sin Bootstrap, jQuery ni librerías UI pesadas.

## Instalación

```bash
npm install
npm run dev
```

Luego abre la URL que muestre Vite en consola.

## Compilar para producción

```bash
npm run build
npm run preview
```

## Rutas principales

- `/` — Ecosistema cultural
- `/fundacion` — Fundación Tamborito
- `/historia` — Historia de la fundación
- `/cursos` — Cursos y programas
- `/biblioteca` — Biblioteca digital
- `/donaciones` — Donaciones
- `/inscripcion` — Formulario de inscripción
- `/museo` — Museo Arqueológico Malibú
- `/museo/historia` — Historia del museo
- `/museo/coleccion` — Colección
- `/museo/exposiciones` — Exposiciones
- `/museo/visitas` — Visitas
- `/museo/investigacion` — Investigación y archivo

## Estructura principal

```txt
src/
  components/
    Navbar.jsx
    PageShell.jsx
    ScrollToTop.jsx
  pages/
    FoundationHome.jsx
    MuseumHome.jsx
    Courses.jsx
    Library.jsx
    Donations.jsx
    Registration.jsx
    ...
  services/
    apiClient.js
  App.jsx
  main.jsx
  styles.css
```

## Conexión futura con Django REST Framework

El archivo `src/services/apiClient.js` queda preparado para consumir el backend usando la variable:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Cuando se cree el backend, solo se agregan servicios por módulo: cursos, biblioteca, donaciones, inscripciones, museo, eventos y contenido institucional.
