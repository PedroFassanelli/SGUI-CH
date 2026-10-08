# Sistema de Gestión de Usuarios Internos

Panel de administración para que el equipo de **Recursos Humanos** de un marketplace gestione el ciclo de vida de los empleados internos: alta, consulta, edición de datos de contacto y baja.

Está compuesto por una **SPA en React** que consume una **API REST propia** en Node.js + Express, con persistencia en **SQLite** mediante **Sequelize**.

---

## Índice

- [Stack](#stack)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Tests y calidad de código](#tests-y-calidad-de-código)
- [Estructura del repositorio](#estructura-del-repositorio)
- [API REST](#api-rest)
- [Modelo de datos y validaciones](#modelo-de-datos-y-validaciones)
- [Decisiones de diseño](#decisiones-de-diseño)
- [Solución de problemas](#solución-de-problemas)

---

## Stack

| Capa         | Tecnologías                                                            |
| ------------ | ---------------------------------------------------------------------- |
| Frontend     | React 19 (hooks), React Router, Vite                                   |
| Backend      | Node.js, Express 5, zod (validación), Swagger UI                       |
| Persistencia | Sequelize (ORM) + SQLite                                               |
| Tests        | `node:test` + Supertest (backend), Vitest + Testing Library (frontend) |
| Calidad      | ESLint (backend), oxlint (frontend), Prettier                          |

## Requisitos previos

- **Node.js 22.13 o superior** (recomendado: la última versión LTS). Verificalo con `node --version`.
- **npm** (viene con Node.js).

No hace falta instalar ninguna base de datos: SQLite guarda todo en un archivo local que se crea automáticamente.

## Instalación

Clonar el repositorio e instalar las dependencias de cada proyecto por separado.

### Backend

```bash
cd backend
npm install
cp .env.example .env     # en Windows (cmd): copy .env.example .env
npm run seed             # crea la base de datos con 3 usuarios de ejemplo
```

> ⚠️ `npm run seed` **borra y vuelve a crear** la tabla de usuarios. Usalo solo para inicializar o resetear la base.

El archivo `.env` es opcional: si no existe se usan los valores por defecto.

| Variable     | Default             | Descripción                                            |
| ------------ | ------------------- | ------------------------------------------------------ |
| `PORT`       | `3000`              | Puerto de la API                                       |
| `DB_STORAGE` | `./database.sqlite` | Ruta del archivo SQLite                                |
| `DB_LOGGING` | `false`             | `true` muestra en consola el SQL que ejecuta Sequelize |

### Frontend

```bash
cd frontend
npm install
```

## Ejecución

Backend y frontend son dos procesos independientes: se levantan en **dos terminales**.

**Terminal 1 — API**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Con ambos corriendo:

| URL                                         | Qué es                                                      |
| ------------------------------------------- | ----------------------------------------------------------- |
| http://localhost:5173                       | **Aplicación** (panel de RRHH)                              |
| http://localhost:3000/api/docs              | Documentación interactiva de la API (Swagger UI)            |
| http://localhost:3000/api/docs/openapi.json | Especificación OpenAPI 3.1 (importable en Postman/Insomnia) |

En desarrollo, Vite reenvía las peticiones a `/api` hacia `http://localhost:3000` (ver `frontend/vite.config.js`), por lo que no hace falta configurar CORS. Ambos procesos se recargan automáticamente al guardar cambios.

### Scripts disponibles

| Proyecto | Comando              | Descripción                                    |
| -------- | -------------------- | ---------------------------------------------- |
| backend  | `npm run dev`        | Inicia la API y la reinicia al guardar cambios |
| backend  | `npm start`          | Inicia la API (sin recarga automática)         |
| backend  | `npm run seed`       | Resetea la base y carga datos de ejemplo       |
| backend  | `npm test`           | Tests de integración de la API                 |
| backend  | `npm run lint`       | Análisis estático con ESLint                   |
| frontend | `npm run dev`        | Servidor de desarrollo de Vite                 |
| frontend | `npm run build`      | Build de producción en `frontend/dist`         |
| frontend | `npm test`           | Tests de validaciones y formularios            |
| frontend | `npm run test:watch` | Tests en modo watch                            |
| frontend | `npm run lint`       | Análisis estático con oxlint                   |
| ambos    | `npm run format`     | Formatea el código con Prettier                |

## Tests y calidad de código

```bash
cd backend && npm test      # 35 tests de integración
cd frontend && npm test     # 24 tests de validación y formularios
```

- **Backend:** cada endpoint se prueba con requests HTTP reales (Supertest) contra una base **SQLite en memoria** (`backend/.env.test`). No necesita la API levantada y no modifica `database.sqlite`.
- **Frontend:** tests de las reglas de validación y de las pantallas de alta y edición con Testing Library, simulando la interacción de un usuario. La API se reemplaza por un mock, por lo que no necesita el backend.

## Estructura del repositorio

```
├── backend/
│   ├── src/
│   │   ├── config/          # variables de entorno y conexión a la base
│   │   ├── models/          # modelo Sequelize (User)
│   │   ├── services/        # lógica de negocio (no conoce HTTP)
│   │   ├── controllers/     # traducen HTTP <-> services
│   │   ├── routes/          # endpoints y su validación
│   │   ├── validation/      # esquemas zod de entrada
│   │   ├── middlewares/     # validación, 404 y manejo centralizado de errores
│   │   ├── errors/          # errores de dominio (NotFound, Conflict, ...)
│   │   ├── docs/            # documento OpenAPI (Swagger)
│   │   ├── app.js           # arma la app Express (importable desde los tests)
│   │   └── server.js        # conecta la base y levanta el servidor
│   ├── scripts/seed.js
│   └── tests/
├── frontend/
│   └── src/
│       ├── api/             # único punto de acceso a la API (fetch)
│       ├── hooks/           # estado: useUsers, useUser, useUserForm
│       ├── components/      # componentes reutilizables (tabla, formulario, diálogo)
│       ├── pages/           # pantallas: listado, alta, edición
│       ├── validation/      # reglas de validación del formulario
│       └── App.jsx          # definición de rutas
└── README.md
```

### Flujo de una petición

```
Frontend:  página → hook → api/usersApi → fetch
                                            │  HTTP /api/users
Backend:   route → validate (zod) → controller → service → model (Sequelize) → SQLite
                       │                                │
                       └──────── errores ───────────────┴──→ errorHandler → { error: { message, details } }
```

## API REST

Base URL: `http://localhost:3000/api`

| Método   | Ruta         | Descripción                                                       | Respuestas                 |
| -------- | ------------ | ----------------------------------------------------------------- | -------------------------- |
| `GET`    | `/users`     | Lista todos los usuarios (orden alfabético por apellido y nombre) | `200`                      |
| `GET`    | `/users/:id` | Obtiene un usuario                                                | `200`, `400`, `404`        |
| `POST`   | `/users`     | Crea un usuario                                                   | `201`, `400`, `409`        |
| `PUT`    | `/users/:id` | Actualiza **email y domicilio**                                   | `200`, `400`, `404`, `409` |
| `DELETE` | `/users/:id` | Elimina un usuario                                                | `204`, `400`, `404`        |
| `GET`    | `/health`    | Estado de la API                                                  | `200`                      |

Ejemplo de alta:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ana","lastName":"García","documentNumber":"30123456","employeeNumber":"EMP-0010","email":"ana@empresa.com","address":"Av. Corrientes 1234"}'
```

Todos los errores tienen el mismo formato:

```json
{
  "error": {
    "message": "El usuario ya existe",
    "details": [
      { "location": "body", "field": "email", "message": "Ya existe un usuario con ese email" }
    ]
  }
}
```

La documentación completa, con ejemplos y la posibilidad de probar cada endpoint, está en **Swagger UI** (`/api/docs`).

## Modelo de datos y validaciones

| Campo            | Descripción               | Reglas                                                                         |
| ---------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `id`             | ID                        | Generado automáticamente por la base                                           |
| `firstName`      | Nombre                    | Obligatorio, hasta 100 caracteres                                              |
| `lastName`       | Apellido                  | Obligatorio, hasta 100 caracteres                                              |
| `documentNumber` | Documento (DNI/Pasaporte) | Obligatorio, **único**, 6 a 20 caracteres alfanuméricos sin puntos ni espacios |
| `employeeNumber` | Legajo                    | Obligatorio, **único**, hasta 20 caracteres alfanuméricos o guiones            |
| `email`          | Email                     | Obligatorio, **único**, formato válido                                         |
| `address`        | Domicilio                 | Obligatorio, hasta 255 caracteres                                              |

Antes de guardar, la API normaliza los datos: elimina espacios sobrantes, guarda el email en minúsculas y el documento y el legajo en mayúsculas.

**Edición:** solo se pueden modificar `email` y `address`. Los datos de identidad (nombre, apellido, documento, legajo) son inmutables; enviarlos en un `PUT` devuelve `400`.

## Decisiones de diseño

- **Arquitectura en capas en el backend.** Cada capa tiene una única responsabilidad, lo que permite testear y modificar cada parte de forma aislada. Los services lanzan errores de dominio sin conocer HTTP; un único middleware los traduce a códigos de estado.
- **Validación en ambos lados.** El frontend valida para dar feedback inmediato; el backend vuelve a validar siempre, porque es la fuente de verdad. Los errores que solo puede detectar el servidor (duplicados) se muestran en el campo correspondiente del formulario.
- **Unicidad delegada a la base.** Documento, legajo y email tienen restricción `UNIQUE`. En lugar de consultar antes de insertar (que tendría problemas con peticiones simultáneas), se deja que la base rechace el duplicado y se responde `409`.
- **Documentación generada desde la validación.** Los cuerpos de las peticiones en Swagger se generan a partir de los mismos esquemas zod que validan la API, por lo que la documentación no puede desactualizarse.
- **Orden alfabético en español.** SQLite ordena texto por bytes ("Álvarez" quedaría después de "Pérez"), así que el listado se ordena con `Intl.Collator('es')`. Es adecuado para un listado sin paginación; si se agregara paginación, el ordenamiento debería hacerse en la base.
- **Frontend sin acceso directo a `fetch`.** Componentes y páginas usan hooks; los hooks usan la capa `api`. Así la UI no conoce URLs ni detalles de HTTP.
- **`sequelize.sync()` en lugar de migraciones.** Suficiente para este alcance; en un entorno productivo se usarían migraciones versionadas.

## Solución de problemas

| Problema                                                    | Solución                                                                                                                                                                                 |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El frontend muestra _"No se pudo conectar con el servidor"_ | La API no está corriendo: ejecutá `npm run dev` en `backend` y tocá **Reintentar**.                                                                                                      |
| `EADDRINUSE` al iniciar                                     | El puerto (3000 o 5173) está ocupado, probablemente por otra instancia. Cerrala o cambiá `PORT` en `backend/.env` (y el proxy en `frontend/vite.config.js`).                             |
| Error al instalar `sqlite3`                                 | Es un módulo nativo. Verificá estar usando Node.js 22.13+; si no hay binario precompilado para tu sistema, npm intentará compilarlo y necesitará las herramientas de compilación de C++. |
| `npm audit` reporta una vulnerabilidad en `uuid`            | Es una dependencia interna de Sequelize y afecta a una función que este proyecto no usa. La "solución" automática degradaría Sequelize a una versión de 2016, por lo que se mantiene.    |
