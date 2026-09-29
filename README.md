# Proyecto: API REST para la gestión de una Biblioteca

**Asignatura:** Programación III  
**Modalidad:** Individual 

## 1. Descripción del proyecto

API REST para la gestión de una biblioteca, desarrollada con Node.js, Express, TypeScript y MongoDB.

La API permite gestionar autores, libros y préstamos mediante operaciones CRUD.

## 2. Tecnologías utilizadas

- Node.js
- Express
- TypeScript
- MongoDB
- MongoDB Driver
- Thunder Client

## 3. Arquitectura

El proyecto utiliza una arquitectura por capas:

- Rutas
- Controladores
- Servicios
- Repositorios
- Modelos

    La estructura de cada módulo sigue el flujo:

   ```text
      Ruta → Controlador → Servicio → Repositorio → MongoDB

## 4. Modulos 
- Autores

Permite crear, consultar, actualizar y eliminar autores

- Libros

Permite crear, consultar, actualizar y eliminar libros, relacionándolos con un autor

- Prestamos

Permite registrar préstamos y devoluciones de libros

## 5. Estructura

todo_api_main/
├── src/
│   ├── api/
│   │   └── v1/
│   │       └── index.ts
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── modules/
│   │   ├── Autores/
│   │   │   ├── controlador.ts
│   │   │   ├── modelo.ts
│   │   │   ├── repositorio.ts
│   │   │   ├── rutas.ts
│   │   │   └── service.ts
│   │   ├── Libro/
│   │   │   ├── controlador.ts
│   │   │   ├── modelo.ts
│   │   │   ├── repositorio.ts
│   │   │   ├── rutas.ts
│   │   │   └── service.ts
│   │   └── Prestamo/
│   │       ├── controlador.ts
│   │       ├── modelo.ts
│   │       ├── repositorio.ts
│   │       ├── rutas.ts
│   │       └── service.ts
│   ├── shared/
│   │   ├── errors/
│   │   │   └── AppError.ts
│   │   └── middlewares/
│   │       ├── asyncHandler.ts
│   │       └── errorHandler.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json

## 6. Instalación

Instalar las dependencias del proyecto:

- npm install

## 7. Configuración de variables de entorno

Crear un archivo .env en la raíz del proyecto

Ejemplo:

PORT=3000
NODE_ENV=development
MONGO_URI=tu_uri_de_mongodb
MONGO_DB_NAME=libreria


## 8. Ejecución

Para ejecutar el proyecto en modo desarrollo:

npm run dev

Para comprobar que el proyecto compila correctamente:

npm run build

## 9. URL base

http://localhost:3000/api/v1

## 10. Endpoints

### Autores

POST | /authors | Crear autor
GET | /authors | Listar autores
GET | /authors/:id | Consultar autor por ID
PUT | /authors/:id | Actualizar autor
DELETE | /authors/:id | Eliminar autor

### Libros

POST | /books | Crear libro
GET | /books | Listar libros
GET | /books/:id | Consultar libro por ID
PUT | /books/:id | Actualizar libro
DELETE | /books/:id | Eliminar libro

### Préstamos

POST | /loans | Crear préstamo
GET | /loans | Listar préstamos
GET | /loans/:id | Consultar préstamo por ID
PUT | /loans/:id | Actualizar préstamo
DELETE | /loans/:id | Eliminar préstamo

## 11. Reglas de negocio

1. No se puede eliminar un autor que tenga libros asociados
2. Un libro solamente puede prestarse si está disponible
3. Al realizar un préstamo, el libro pasa a estar no disponible
4. Al devolver un libro, se registra la fecha de devolución y el libro vuelve a estar disponible

## 12. Base de datos

La aplicación utiliza MongoDB.

Nombre de la base de datos:

libreria

## 13. Pruebas

Las pruebas de los endpoints se realizan utilizando Thunder Client
Proyecto desarrollado para la asignatura de Programación III
