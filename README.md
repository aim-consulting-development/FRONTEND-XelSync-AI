# FRONTEND - XelSync AI

Plataforma B2B corporativa de automatización aduanera para empresas IMMEX en México. Este repositorio contiene la interfaz de usuario moderna, enfocada en la captura, validación y conciliación inteligente de pedimentos.

## 🚀 Características del Proyecto

- **Framework**: Next.js (App Router), React 18, TypeScript
- **Estilos**: Tailwind CSS 4
- **Componentes UI**: Shadcn UI (Button, Input, Table, Dialog, etc.)
- **Iconos**: Lucide React (Diseño minimalista y limpio)
- **Fuentes**: 
  - `Inter` para la interfaz general.
  - `JetBrains Mono` para datos aduaneros precisos (Pedimentos, RFCs, Fracciones Arancelarias).
- **Dockerizado**: Despliegue optimizado con modo `standalone` listo para producción.

## 📦 Requisitos Previos

- Node.js 20+ (para desarrollo local)
- Docker y Docker Compose (para despliegue en contenedores)
- El Backend de XelSync AI corriendo y accesible (por defecto en `http://localhost:8000`).

## 🛠 Instrucciones de Uso (Para el Desarrollador Frontend)

### Desarrollo Local (Hot Reload)

1. Ingresar a la carpeta del proyecto:
   ```bash
   cd frontend-xelsync-ai
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. El servidor arrancará en **[http://localhost:3001](http://localhost:3001)** (o en el puerto disponible si el 3000 está ocupado).
5. Abre el navegador y asegúrate de que el Backend esté corriendo en el puerto 8000.

### 🐳 Despliegue con Docker (Producción)

El proyecto está configurado para empaquetarse de manera ultraligera utilizando la opción `standalone` de Next.js.

1. Desde la **raíz del repositorio** (donde está el archivo `docker-compose.yml`), ejecuta:
   ```bash
   docker-compose up -d --build
   ```
2. Esto construirá la imagen del frontend y levantará el contenedor.
3. El frontend estará disponible en el puerto especificado (usualmente 3001).

Para detener el contenedor:
```bash
docker-compose down
```

## 🔌 Conexión con el Backend (API)

El Backend corre localmente en `http://localhost:8000/api/v1`. Para que la app funcione debes considerar:

1. **Autenticación (JWT):**
   - El endpoint de Login es `POST /auth/login`. Debes enviar las credenciales como un formulario (`application/x-www-form-urlencoded`, no JSON).
   - Recibirás un `access_token`.
   - Debes adjuntar este token en el encabezado `Authorization: Bearer <token>` para **todas** las demás llamadas usando un interceptor en Axios/Fetch.

2. **Extracción y Carga Masiva (Archivos y ZIPs):**
   - Endpoint de subida: `POST /extraccion/upload` (Form-data: campo `file`).
   - ¡Nuevo!: Ahora el backend soporta subida de archivos `.zip`. Cuando se envía un ZIP, la API responde de inmediato, pero el backend descomprimirá e inyectará los PDFs internos a la base de datos de manera silente (patrón Fan-Out). 
   - **Tarea Frontend:** Si el usuario sube un ZIP, el Dashboard debe "refrescar" periódicamente o utilizar SSE/WebSockets (si estuvieran implementados) o hacer polling al estatus para ver cómo van apareciendo los nuevos documentos hijos y mostrar su progreso (`SUBIENDO` -> `EXTRAYENDO` -> `COMPLETADO`).

3. **Reintentos de Fallos IA:**
   - La IA de Gemini puede fallar (Timeouts de Google). Si un documento queda en estado `ERROR`, debes mostrar un botón en la UI para reintentarlo llamando a `POST /extraccion/retry/{archivo_id}`.

## 🧩 Estructura y Vistas Principales (Por Implementar)

- **Login & Auth (`/login`)**: Conexión con el Backend para obtener JWT.
- **Dashboard (`/`)**: KPIs, resumen de pedimentos extraídos, alertas de SLAs. Incluye el listado de archivos en procesamiento.
- **Split View de Revisión (`/pedimentos/[id]/revision`)**:
  - Panel izquierdo: Visor de PDF embebido.
  - Panel derecho: Formulario estructurado por Tabs (Encabezado, Facturas, Partidas).
  - Alertas predictivas y sugerencias de la IA destacadas visualmente.
- **Generación de InterXel**: Botón para descargar la plantilla llamando a `GET /pedimentos/{id}/export_interxel`.

## 🛡 Consideraciones de Desarrollo

- **Aesthetics & UI**: La aplicación maneja información de alta criticidad aduanera. El diseño debe ser institucional, moderno (vibrante, Dark Mode, Micro-animaciones) y evitar pantallas de carga lentas (usa Skeleton loaders).
- **Manejo de Errores**: Mostrar alertas tipo Toast de Shadcn cuando las operaciones de IA fallen y ofrezcan al usuario la opción de "Reintentar".
