# JobScout Desktop

**JobScout Desktop** es una aplicación de escritorio desarrollada con **Electron**, **React** y **Vite** que permite buscar ofertas laborales por palabra clave en distintas fuentes, centralizar los resultados en una tabla, marcar ofertas como vistas o favoritas y abrir las publicaciones originales en el navegador.

El objetivo del proyecto es construir una herramienta simple de seguimiento laboral y, al mismo tiempo, mostrar una aplicación desktop funcional como proyecto de portfolio.

---

## Características principales

* Aplicación de escritorio para Windows.
* Búsqueda de ofertas laborales por palabra clave.
* Integración con múltiples fuentes de empleo:

  * Remotive
  * Remote OK
  * Arbeitnow
* Normalización de resultados en una misma tabla.
* Filtro de duplicados por URL.
* Ordenamiento de ofertas por fecha de publicación.
* Apertura de ofertas en el navegador externo.
* Estados de seguimiento:

  * Nuevo
  * Visto
* Sistema de favoritos independiente mediante estrella.
* Persistencia local de vistos y favoritos usando `localStorage`.
* Filtros por estado:

  * Todos
  * Nuevos
  * Vistos
  * Favoritos
* Instalador `.exe` para Windows generado con Electron Builder.

---

## Tecnologías utilizadas

* **Electron** — Empaquetado como aplicación de escritorio.
* **React** — Interfaz de usuario.
* **Vite** — Entorno de desarrollo y build frontend.
* **JavaScript** — Lenguaje principal del proyecto.
* **Electron Builder** — Generación del instalador para Windows.
* **localStorage** — Persistencia local de estados y favoritos.

---

## Funcionamiento general

El usuario ingresa una palabra clave, por ejemplo:

```txt
react
php
drupal
developer
remote
```

La aplicación consulta distintas fuentes de empleo, normaliza los resultados y los muestra en una tabla unificada.

Cada oferta puede marcarse como vista al abrirse, o como favorita mediante una estrella. Estos datos quedan guardados localmente, por lo que se mantienen aunque se cierre y vuelva a abrir la app.

---

## Fuentes integradas

Actualmente la aplicación obtiene resultados desde:

| Fuente    | Tipo de integración |
| --------- | ------------------- |
| Remotive  | API pública         |
| Remote OK | Endpoint público    |
| Arbeitnow | API pública         |

Todas las fuentes se normalizan al mismo formato interno para poder mostrarse juntas en la misma tabla.

Formato interno simplificado:

```js
{
  id,
  title,
  company,
  source,
  publishedAt,
  publishedAtRaw,
  keyword,
  url,
  location,
  category,
  tags,
  description,
  status,
  isFavorite
}
```

---

## Instalación para desarrollo

Clonar el repositorio:

```bash
git clone https://github.com/TU_USUARIO/job-scout-desktop.git
```

Entrar al proyecto:

```bash
cd job-scout-desktop
```

Instalar dependencias:

```bash
npm install
```

Levantar la aplicación en modo desarrollo:

```bash
npm run start
```

Este comando inicia Vite y abre la aplicación con Electron.

---

## Scripts disponibles

```bash
npm run dev
```

Inicia el servidor de desarrollo de Vite.

```bash
npm run electron
```

Abre Electron apuntando al servidor local de Vite.

```bash
npm run start
```

Ejecuta Vite y Electron en paralelo.

```bash
npm run build
```

Genera el build de producción del frontend.

```bash
npm run dist
```

Genera el build de producción y crea el instalador `.exe` para Windows.

---

## Generar instalador para Windows

Para generar el instalador:

```bash
npm run dist
```

El instalador se genera en la carpeta:

```txt
release/
```

Ejemplo de archivo generado:

```txt
JobScout Desktop Setup 0.0.0.exe
```

La carpeta `release/` está ignorada por Git para evitar subir archivos pesados al repositorio.

---

## Estructura principal del proyecto

```txt
job-scout-desktop/
│
├── electron/
│   ├── main.cjs
│   └── preload.cjs
│
├── src/
│   ├── services/
│   │   ├── remotiveApi.js
│   │   ├── remoteOkApi.js
│   │   ├── arbeitnowApi.js
│   │   └── jobSearchService.js
│   │
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

---

## Seguridad en Electron

La aplicación mantiene una configuración segura para la comunicación entre React y Electron:

* `contextIsolation: true`
* `nodeIntegration: false`
* Uso de `preload.cjs`
* Comunicación mediante `ipcRenderer` / `ipcMain`
* Apertura de enlaces externos con `shell.openExternal`

Esto evita exponer directamente APIs de Node.js dentro del frontend.

---

## Estado actual del proyecto

El proyecto cuenta actualmente con:

* MVP funcional de aplicación desktop.
* Búsqueda real de empleos en múltiples fuentes.
* Tabla unificada de resultados.
* Favoritos persistentes.
* Estados de lectura persistentes.
* Filtros por estado.
* Instalador funcional para Windows.

---

## Autor

Proyecto desarrollado por **Ramiro Sampaoli** 
