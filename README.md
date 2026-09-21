# Prof. Carlos Reges

Sitio web de clases de apoyo escolar y preparación para exámenes de ingreso. La web presenta los servicios, materias, metodología de trabajo, testimonios, recursos educativos y canales de contacto del Prof. Carlos Reges.

## Funcionalidades

- Diseño responsive para escritorio, tablet y móvil.
- Página principal con propuesta educativa, preguntas frecuentes y acceso al contacto.
- Página `contacto.html` con formulario, datos de contacto y redes sociales.
- Página `aboutMe.html` con perfil profesional, experiencia, áreas de enseñanza y recursos digitales.
- Formulario de contacto conectado a Formspree.
- Enlaces a email, teléfono, WhatsApp, Discord y redes sociales.
- Material de estudio organizado por asignatura.

## Tecnologías

- HTML5, CSS3 y JavaScript vanilla.
- Bootstrap 5 para la estructura responsive y componentes.
- Express 4 para servir el sitio y gestionar la API de reservas.
- Boxicons y Font Awesome para iconografía.
- Google Fonts: DM Sans y Fraunces.

## Requisitos

- Node.js 18 o superior.
- npm.

## Instalación y ejecución

1. Instalar las dependencias:

	```bash
	npm install
	```

2. Iniciar el servidor:

	```bash
	npm start
	```

3. Abrir en el navegador:

	```text
	http://localhost:3000
	```

Para desarrollo con reinicio automático:

```bash
npm run dev
```

El servidor crea `reservas.json` automáticamente dentro de la carpeta externa `../profereges-data`, fuera del contenido público del sitio. Allí se almacenan los datos locales de las reservas.

## Estructura principal

```text
.
├── index.html                 # Página principal
├── aboutMe.html               # Perfil profesional
├── contacto.html              # Formulario y datos de contacto
├── blog.html                  # Blog
├── clases.html                # Material de estudio
├── server.js                  # Servidor Express y API de reservas
├── assets/
│   ├── css/style.css          # Estilos globales y paleta visual
│   ├── js/                    # JavaScript del sitio
│   ├── img/                   # Imágenes, logo y fotografía de perfil
│   └── vendor/                # Dependencias estáticas
├── blog-articulos/            # Artículos individuales
└── material/                  # Material organizado por asignatura
```

## API de reservas

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/reservas` | Consulta las reservas registradas |
| `POST` | `/api/reservas` | Crea una nueva reserva |

La API limita las reservas a un máximo de tres horas por solicitud, controla el cupo disponible por horario y solo devuelve conteos de disponibilidad. Los datos personales no se exponen mediante `GET /api/reservas`.

## Identidad visual

La paleta principal está definida mediante variables CSS en `assets/css/style.css`:

- Azul profundo: `#1C354E`
- Amarillo: `#FFB800`
- Naranja: `#FF9900`
- Blanco: `#FFFFFF`
- Texto oscuro: `#222222`

## Notas

- El sitio es principalmente estático; el servidor Express se utiliza para las reservas.
- La protección de contenidos del frontend, como imágenes o contraseñas, solo puede ser disuasoria y no sustituye una solución de backend segura.
- No se incluyen credenciales ni datos de producción en este repositorio.