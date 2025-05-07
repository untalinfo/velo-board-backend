# VeloBoard

![VeloBoard Logo](./assets/velo-logo.png)

Gestiona proyectos y tareas de forma visual con esta aplicación Kanban en tiempo real. Su frontend en React.js ofrece una experiencia de usuario intuitiva con drag & drop, mientras que el backend en NestJS con WebSockets garantiza la colaboración fluida.

## Tabla de Contenidos

- [Primeros Pasos](#primeros-pasos)
- [Características](#características)
- [Diseño Figma](#diseño-figma)
- [Construcción](#construcción)
- [Documentación API](#documentación-api)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)
- [Autor](#autor)

## Primeros pasos

Crea un archivo .env en la raíz del proyecto y configura esta variable de entorno:
```
PORT=3001 # O el puerto que prefieras para el backend
MONGODB_URI=mongodb://localhost:27017/veloboard # Cambia si tu DB se llama diferente o está en otro host/puerto
```

Primero, Instalar dependencias:

```bash
yarn install
```

Segundo, ejecutar el development server:

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Características

La aplicación permite:

- Creación de Tableros: Los usuarios podrán crear nuevos tableros para organizar diferentes proyectos o flujos de trabajo.
- Columnas Personalizables: Dentro de cada tablero, los usuarios podrán crear, renombrar y eliminar columnas para representar las diferentes etapas del proceso (ej. "Por Hacer", "En Progreso", "Hecho").
- Creación de Tarjetas: Dentro de cada columna, los usuarios podrán crear tarjetas que representan tareas individuales. Cada tarjeta tendrá al menos un título y opcionalmente una descripción más detallada.
- Movimiento de Tarjetas (Drag & Drop): Los usuarios podrán arrastrar y soltar tarjetas entre diferentes columnas para cambiar su estado o prioridad.
- Reordenación de Tarjetas: Dentro de cada columna, los usuarios podrán arrastrar y soltar tarjetas para cambiar su orden de prioridad.

Con un diseño adaptable y enfocado en el rendimiento, VeloBoard utiliza estrategias avanzadas como Server Components y SSR para optimizar la experiencia del usuario, demostrando una sólida arquitectura y una cuidada organización del código.

## Diseño Figma

![Figma](./assets/figma-design.png)

Puedes revisar el prototipo en el siguiente link: [Protitipo Figma](https://hoost.ru/ds/free/53474f9a/live/?macbook-air-1)

## Construcción

Este proyecto está construido utilizando las siguientes tecnologías y herramientas:

- **NestJS**: Un framework progresivo de Node.js para construir aplicaciones del lado del servidor.
- **MongoDB**: Una base de datos NoSQL orientada a documentos para almacenar datos de manera eficiente.
- **TypeScript**: Un superconjunto de JavaScript que añade tipado estático al lenguaje.
- **WebSockets**: Protocolo para comunicación en tiempo real entre cliente y servidor.
- **Jest**: Un framework de pruebas para asegurar la calidad del código.
- **ESLint**: Herramienta para analizar y mantener la calidad del código.
- **Prettier**: Formateador de código para mantener consistencia en el estilo.

### Estructura del proyecto

La estructura del proyecto es la siguiente:

```
/velo-board-backend
├── node_modules/       # Dependencias del proyecto
├── dist/               # Archivos compilados
├── src/                # Código fuente del backend
│   ├── app.module.ts   # Módulo principal de la aplicación
│   ├── main.ts         # Punto de entrada de la aplicación
│   ├── modules/        # Módulos organizados por funcionalidad
│   ├── services/       # Servicios reutilizables
│   └── utils/          # Utilidades y helpers
├── test/               # Pruebas unitarias y de integración
├── .env.example        # Ejemplo de configuración de variables de entorno
├── package.json        # Archivo de configuración de npm
├── tsconfig.json       # Configuración de TypeScript
└── README.md           # Documentación del proyecto
```
## Documentación API

A continuación, se detalla la documentación de los endpoints disponibles en la API del backend de VeloBoard:

| Método | Endpoint                | Descripción                                                                 | Parámetros                                                                                     | Ejemplo de Respuesta                                                                 |
|--------|-------------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| GET    | `/api/boards`           | Obtiene todos los tableros disponibles.                                     | Ninguno                                                                                        | `[{"id": "1", "name": "Proyecto A"}, {"id": "2", "name": "Proyecto B"}]`            |
| POST   | `/api/boards`           | Crea un nuevo tablero.                                                     | `name` (string, requerido)                                                                    | `{"id": "3", "name": "Nuevo Tablero"}`                                              |
| GET    | `/api/boards/:id`       | Obtiene los detalles de un tablero específico.                             | `id` (string, requerido)                                                                      | `{"id": "1", "name": "Proyecto A", "columns": [{"id": "1", "name": "Por Hacer"}]}`  |
| PUT    | `/api/boards/:id`       | Actualiza la información de un tablero.                                    | `id` (string, requerido), `name` (string, opcional)                                           | `{"id": "1", "name": "Proyecto Actualizado"}`                                       |
| DELETE | `/api/boards/:id`       | Elimina un tablero específico.                                             | `id` (string, requerido)                                                                      | `{"message": "Tablero eliminado exitosamente"}`                                     |
| POST   | `/api/columns`          | Crea una nueva columna en un tablero.                                      | `boardId` (string, requerido), `name` (string, requerido)                                     | `{"id": "1", "name": "En Progreso", "boardId": "1"}`                                |
| PUT    | `/api/columns/:id`      | Actualiza la información de una columna.                                   | `id` (string, requerido), `name` (string, opcional)                                           | `{"id": "1", "name": "Finalizado"}`                                                 |
| DELETE | `/api/columns/:id`      | Elimina una columna específica.                                            | `id` (string, requerido)                                                                      | `{"message": "Columna eliminada exitosamente"}`                                     |
| POST   | `/api/cards`            | Crea una nueva tarjeta en una columna.                                     | `columnId` (string, requerido), `title` (string, requerido), `description` (string, opcional) | `{"id": "1", "title": "Nueva Tarea", "description": "Detalles de la tarea"}`        |
| PUT    | `/api/cards/:id`        | Actualiza la información de una tarjeta.                                   | `id` (string, requerido), `title` (string, opcional), `description` (string, opcional)        | `{"id": "1", "title": "Tarea Actualizada", "description": "Detalles actualizados"}` |
| DELETE | `/api/cards/:id`        | Elimina una tarjeta específica.                                            | `id` (string, requerido)                                                                      | `{"message": "Tarjeta eliminada exitosamente"}`                                     |
| PATCH  | `/api/cards/:id/move`   | Mueve una tarjeta a otra columna o cambia su posición dentro de la misma.  | `id` (string, requerido), `targetColumnId` (string, requerido), `position` (number, opcional) | `{"id": "1", "columnId": "2", "position": 1}`                                       |

Esta tabla proporciona una visión general de los endpoints disponibles, sus métodos HTTP, parámetros requeridos y ejemplos de respuesta para facilitar la integración con la API.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue los siguientes pasos para contribuir:

1. Haz un fork del repositorio.
2. Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).
3. Realiza tus cambios y haz commit (git commit -am 'Añadir nueva funcionalidad').
4. Haz push a la rama (git push origin feature/nueva-funcionalidad).
5. Abre un Pull Request.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## Autor

Proyecto desarrollado por:

[Untalinfo - GitHub](https://github.com/untalinfo)

[LinkedIn](https://www.linkedin.com/in/untalinfo/)

[email: racso1607@gmail.com](racso1607@gmail.com)


## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```