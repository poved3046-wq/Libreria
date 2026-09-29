# Todo API

API REST para gestionar tareas (todos), construida con **Node.js**, **Express 5**, **TypeScript** y **MongoDB**.

El proyecto sigue una arquitectura por capas (rutas → controlador → servicio → repositorio) que separa responsabilidades y facilita el mantenimiento y las pruebas.

## Tabla de contenidos

- [Requisitos](#requisitos)
- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Cómo levantar el proyecto](#cómo-levantar-el-proyecto)
- [Endpoints](#endpoints)
- [Modelo de datos](#modelo-de-datos)
- [Manejo de errores](#manejo-de-errores)

## Requisitos

- **Node.js** 18 o superior
- **npm** 9 o superior
- Una base de datos **MongoDB** (local o en la nube, por ejemplo MongoDB Atlas)

## Arquitectura y estructura

La aplicación separa las responsabilidades en capas bien definidas. El flujo de una petición es:

```
Petición HTTP
   │
   ▼
Rutas (task.routes.ts)          Definen los endpoints y aplican asyncHandler
   │
   ▼
Controlador (task.controller.ts) Traduce HTTP <-> lógica; arma la respuesta
   │
   ▼
Servicio (task.service.ts)       Reglas de negocio y validaciones
   │
   ▼
Repositorio (task.repository.ts) Acceso directo a la colección de MongoDB
   │
   ▼
MongoDB
```

Estructura de carpetas:

```
todo-api/
├── src/
│   ├── api/
│   │   └── v1/
│   │       └── index.ts              # Enrutador raíz de la versión v1
│   ├── config/
│   │   ├── database.ts               # Conexión a MongoDB (connectDB / getDb)
│   │   └── env.ts                    # Carga y validación de variables de entorno
│   ├── modules/
│   │   └── tasks/
│   │       ├── task.controller.ts    # Controlador HTTP
│   │       ├── task.model.ts         # Interfaces Task + DTOs
│   │       ├── task.repository.ts    # Operaciones sobre la colección
│   │       ├── task.routes.ts        # Rutas del módulo de tareas
│   │       └── task.service.ts       # Lógica de negocio y validaciones
│   ├── shared/
│   │   ├── errors/
│   │   │   └── AppError.ts           # AppError, BadRequestError, NotFoundError
│   │   └── middlewares/
│   │       ├── asyncHandler.ts       # Captura errores de controladores async
│   │       └── errorHandler.ts       # Middleware 404 y de errores centralizado
│   ├── app.ts                        # Configuración de Express y middlewares
│   └── server.ts                     # Punto de entrada: conecta la BD y escucha
├── .env.example                      # Plantilla de variables de entorno
├── package.json
└── tsconfig.json
```

### Middlewares aplicados

En `app.ts` se registran, en orden:

- `express.json()` — parseo de cuerpos JSON.
- `cors()` — habilita peticiones desde otros orígenes.
- `compression()` — comprime las respuestas.
- `helmet()` — cabeceras de seguridad HTTP.
- `morgan("dev")` — registro de peticiones en consola.

Al final se registran el middleware `notFound` (rutas inexistentes) y el `errorHandler` (manejo centralizado de errores).

## Instalación

Clona el repositorio e instala las dependencias:

```bash
npm install
```

## Variables de entorno

El proyecto lee la configuración desde un archivo `.env` en la raíz. Usa `.env.example` como plantilla:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable        | Descripción                                        | Requerida | Valor por defecto |
| --------------- | -------------------------------------------------- | --------- | ----------------- |
| `PORT`          | Puerto donde escucha el servidor HTTP              | No        | `3000`            |
| `NODE_ENV`      | Entorno: `development`, `production` o `test`      | No        | `development`     |
| `MONGO_URI`     | Cadena de conexión de MongoDB                      | **Sí**    | —                 |
| `MONGO_DB_NAME` | Nombre de la base de datos                         | No        | `collaborate`     |

> Si `MONGO_URI` no está definida, la aplicación falla al arrancar con un mensaje claro. El archivo `.env` está en `.gitignore`, así que las credenciales no se suben al repositorio.

## Cómo levantar el proyecto

### Modo desarrollo

Usa recarga automática con `nodemon` + `ts-node`:

```bash
npm run dev
```

### Modo producción

Compila TypeScript a JavaScript y ejecuta el resultado:

```bash
npm run build   # genera la carpeta build/
npm start       # ejecuta build/server.js
```

Si todo está bien verás en consola:

```
Conectado a MongoDB (db: collaborate)
Servidor corriendo en el puerto 3000 [development]
```

### Comprobar que está vivo

```bash
curl http://localhost:3000/health
# { "status": "ok", "uptime": 12.34 }
```

## Endpoints

Base URL: `http://localhost:3000/api/v1/task`

| Método   | Ruta         | Descripción                       | Cuerpo (JSON)                                  | Respuesta |
| -------- | ------------ | --------------------------------- | ---------------------------------------------- | --------- |
| `POST`   | `/`          | Crea una tarea                    | `{ "title", "description", "isDone?" }`        | `201`     |
| `GET`    | `/`          | Lista todas las tareas            | —                                              | `200`     |
| `GET`    | `/:id`       | Obtiene una tarea por su id       | —                                              | `200`     |
| `PUT`    | `/:id`       | Actualiza una tarea (parcial)     | `{ "title?", "description?", "isDone?" }`      | `200`     |
| `DELETE` | `/:id`       | Elimina una tarea                 | —                                              | `204`     |

Además existe `GET /health` para verificar el estado del servicio.

### Ejemplos con curl

Crear una tarea:

```bash
curl -X POST http://localhost:3000/api/v1/task \
  -H "Content-Type: application/json" \
  -d '{"title": "Estudiar", "description": "Repasar Express y MongoDB"}'
```

Listar tareas:

```bash
curl http://localhost:3000/api/v1/task
```

Actualizar el estado de una tarea:

```bash
curl -X PUT http://localhost:3000/api/v1/task/<id> \
  -H "Content-Type: application/json" \
  -d '{"isDone": true}'
```

Eliminar una tarea:

```bash
curl -X DELETE http://localhost:3000/api/v1/task/<id>
```

## Modelo de datos

Una tarea (`Task`) almacenada en MongoDB tiene la siguiente forma:

```ts
{
  _id: ObjectId,        // generado por MongoDB
  title: string,        // obligatorio, texto no vacío
  description: string,  // obligatorio, texto no vacío
  isDone: boolean,      // por defecto false
  createdAt: Date,      // fecha de creación
  updatedAt: Date       // fecha de última actualización
}
```

Al crear o actualizar se usa un único DTO (`TaskDTO`) con todos los campos opcionales; el servicio decide qué es obligatorio según la operación (crear exige `title` y `description`, actualizar acepta cambios parciales).

## Manejo de errores

Las respuestas de error siguen un formato consistente:

```json
{
  "status": "error",
  "message": "Descripción del problema"
}
```

Códigos usados:

- `400 Bad Request` — datos inválidos o faltantes (por ejemplo un `title` vacío o un id con formato incorrecto).
- `404 Not Found` — la tarea no existe o la ruta no está registrada.
- `500 Internal Server Error` — error inesperado del servidor. En `development` se incluye el stack trace; en `production` se oculta.
