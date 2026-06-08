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

## 🛠 Instrucciones de Uso

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
4. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

### 🐳 Despliegue con Docker (Producción)

El proyecto está configurado para empaquetarse de manera ultraligera utilizando la opción `standalone` de Next.js.

1. Desde la **raíz del repositorio** (donde está el archivo `docker-compose.yml`), ejecuta:
   ```bash
   docker-compose up -d --build
   ```
2. Esto construirá la imagen del frontend y levantará el contenedor.
3. El frontend estará disponible en [http://localhost:3000](http://localhost:3000).

Para detener el contenedor:
```bash
docker-compose down
```

## 🧩 Estructura y Vistas Principales (Por Implementar)

- **Login & Auth (`/login`)**: Conexión con el Backend para obtener JWT.
- **Dashboard (`/`)**: KPIs, resumen de pedimentos extraídos, alertas de SLAs.
- **Módulo de Extracción IA**:
  - Subida de PDF y tracking de progreso en tiempo real (Polling).
- **Split View de Revisión (`/pedimentos/[id]/revision`)**:
  - Panel izquierdo: Visor de PDF embebido.
  - Panel derecho: Formulario estructurado por Tabs (Encabezado, Facturas, Partidas).
  - Alertas predictivas y sugerencias de la IA destacadas visualmente.
- **Catálogos & Conciliación SAT**: Importador Excel masivo y tablas de discrepancias.

## 🛡 Consideraciones de Desarrollo

- **Aesthetics & UI**: La aplicación maneja información de alta criticidad aduanera. El diseño debe ser institucional, evitando barras de carga lentas y priorizando skeleton loaders y densidad de datos eficiente.
- **Autenticación**: Asegurar que todas las peticiones a la API incluyan el encabezado `Authorization: Bearer <token>` mediante un interceptor (Axios o fetch wrapper).
- **Manejo de Errores (Error Bubbling)**: Mostrar "Tarjetas de Atención" claramente en la parte superior cuando existan validaciones fallidas del SAT.
