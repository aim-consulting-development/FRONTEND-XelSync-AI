# PROMPT DEFINITIVO PARA DESARROLLO FRONTEND - XelSync AI
**Versión:** 8.0 FINAL INTEGRADA | **Fecha:** Junio 2026 | **Criticidad:** MÁXIMA
**Objetivo:** Construir el frontend completo, premium y funcional del sistema XelSync AI en Next.js.
**Dirigido a:** Desarrollador Frontend / Asistente IA (Cursor, v0, Claude, Bolt).

---

## 1. CONTEXTO COMPLETO DEL PROYECTO Y BACKEND REALIDAD

### 1.1 ¿Qué es XelSync AI?
XelSync AI es una plataforma web B2B corporativa de automatización aduanera para empresas IMMEX en México. Su propósito es automatizar el proceso de captura, validación y conciliación de pedimentos aduanales, cumpliendo estrictamente con el **Anexo 24** y el **Anexo 30** del SAT. 

Actualmente, el backend ya está **100% construido y funcional** con FastAPI, PostgreSQL, Redis y Celery. Se ha probado con éxito la orquestación de la carga de PDFs, el análisis con IA (Anthropic/Gemini) y el guardado en base de datos. El frontend solo necesita consumir esta API robusta.

### 1.2 Stack Tecnológico Frontend a Utilizar
| Componente | Tecnología |
|---|---|
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Estilos** | Tailwind CSS |
| **Componentes UI** | Shadcn UI (Button, Input, Table, Dialog, Tabs, Select, Badge, Card, Toast, Drawer, Command, DropdownMenu, Sheet) |
| **Fetching de datos** | Axios + SWR (o React Query) |
| **Iconos** | Lucide React (**NO EMOJIS**, solo SVG minimalista) |
| **Fuentes** | Inter (UI principal), JetBrains Mono (datos aduaneros) |
| **Estado Global** | Zustand (Sesión, Auth, Tema) |

---

## 2. DIRECTRICES DE DISEÑO Y UX/UI (Reglas Inquebrantables)

### 2.1 Estética General y Ergonomía
- La interfaz debe ser **estrictamente ejecutiva, corporativa y premium**. (Referencia: Stripe, Vercel, Linear).
- **Densidad de Datos Inteligente:** Priorizar la lectura rápida de pedimentos sin generar fatiga visual.
- **Ausencia Absoluta de Emojis:** Mantener un tono institucional.

### 2.2 Paleta de Colores Corporativa
| Token Semántico | Hexadecimal (Light) | Hexadecimal (Dark Mode) | Uso |
|---|---|---|---|
| Fondo Principal | `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) | Background general |
| Superficies | `#FFFFFF` | `#1E293B` (Slate 800) | Cards, modales, formularios |
| Sidebar / Navbar | `#0F172A` | `#020617` (Slate 950) | Barra lateral (Siempre oscura) |
| Bordes | `#E2E8F0` | `#334155` | Separadores sutiles |
| **Primario (Acción)** | `#2563EB` (Blue 600) | `#3B82F6` (Blue 500) | Botones, Enlaces, Focus Rings |
| **Éxito / Aprobado** | `#059669` (Emerald 600) | `#10B981` (Emerald 500)| Pedimentos aprobados, validaciones OK |
| **Peligro / Error**| `#DC2626` (Red 600) | `#EF4444` (Red 500) | SLA Vencido, Discrepancias SAT |
| **Advertencia** | `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | Revisión manual, SLA en riesgo |
| **Sugerencia IA** | `#10B981` (Emerald 500) | `#34D399` (Emerald 400) | Borde y acento de sugerencias de Claude/Gemini |

### 2.3 Tipografía
- **Fuente Principal (UI):** `Inter` (Pesos: 400, 500, 600).
- **Fuente Monospaciada:** `JetBrains Mono` o `Roboto Mono` (Pesos: 400, 500). **OBLIGATORIO** para todos los números de pedimento (`26 48 3949 6001064`), RFCs, fracciones arancelarias (`32100091`), montos (`$536,194.00`) y tipos de cambio (`17.6543`).

### 2.4 Micro-interacciones y Transiciones
- **Curva de animación:** `cubic-bezier(0.4, 0, 0.2, 1)`. Duración máxima `200ms` (muy rápido y responsivo).
- **Carga de Datos:** Jamás usar Spinners de pantalla completa. Utilizar **Skeleton Loaders** (bloques grises parpadeantes) en el área específica.
- **Barra de Progreso:** Para procesos de fondo (como la extracción de la IA mediante Celery), mostrar una barra de progreso lineal superior.

---

## 3. ARQUITECTURA DEL LAYOUT Y NAVEGACIÓN

### 3.1 Estructura Global
1. **Top Navbar:** Altura 64px, Fixed. Contiene: Breadcrumbs a la izquierda, Global Search (Cmd+K) al centro, Campana de Notificaciones y Dropdown de Avatar a la derecha.
2. **Sidebar:** Ancho 260px (Colapsable a 72px), Fixed. Color fijo `#0F172A`. Links con iconos Lucide (`LayoutDashboard`, `FileText`, `BookOpen`, `Scale`, `ShieldCheck`).
3. **Main Content:** Área fluida con padding de 24px y scroll vertical independiente.

---

## 4. CONTRATOS API Y FUNCIONAMIENTO DE ENDPOINTS PRINCIPALES

El backend ya expone las siguientes rutas REST. El frontend debe implementar la gestión del Token JWT (Bearer) en los headers mediante un Interceptor de Axios.

### 4.1 Autenticación
- **POST `/api/v1/auth/login`**: Body `{ email, password }`. Retorna `access_token`.
- **GET `/api/v1/auth/me`**: Retorna el rol del usuario (`ADMIN`, `OPERADOR`, etc.) y su cartera de empresas asignadas para renderizado condicional.

### 4.2 Flujo Crítico de Carga y Extracción IA (Implementar con exactitud)
El usuario sube un PDF, el cual entra a una cola asíncrona de Celery en el backend.
1. **Petición Inicial:**
   `POST /api/v1/extraccion/upload` (multipart/form-data con archivo PDF).
   *Respuesta HTTP 202*: `{ "task_id": "...", "archivo_id": 4 }`
2. **Polling de Estado:** El frontend debe hacer un polling (ej. cada 3 segundos) con SWR.
   `GET /api/v1/extraccion/status/{archivo_id}`
   *Respuesta*: `{ "estado": "EXTRAYENDO", "progreso": 50, ... }`. Mostrar estos cambios en una barra de progreso.
3. **Finalización:** Cuando el polling devuelva `"estado": "COMPLETADO"`, retornará un `tracking_id`. El frontend debe redireccionar automáticamente a `/pedimentos/{tracking_id}/revision`.

---

## 5. MÓDULO ESTRELLA: "SPLIT VIEW" REVISIÓN INTELIGENTE (`/pedimentos/[id]/revision`)

Este es el corazón de la app y la vista más compleja. El operador validará los datos que extrajo la IA.
- **Layout 40/60:**
  - **Panel Izquierdo (40%, Sticky):** Visor embebido del PDF original para consulta cruzada.
  - **Panel Derecho (60%, Scroll):** Formulario con los datos.

### 5.1 Error Bubbling (Atención Inmediata)
Antes de las pestañas de datos, debe haber una sección roja o ámbar llamada **"Campos que requieren atención"**.
- Si el backend (`resultado_validacion` en el GET de Pedimentos) arrojó un error o discrepancia, la "tarjeta de error" se muestra aquí arriba para evitar que el usuario tenga que cazar los errores en todo el formulario.
- **Tarjeta de Error:** Muestra el Campo, el Valor actual, el motivo del error, y un botón con un icono brillante de **Sugerencia IA** (ej. "Sugerido: 17.6543 (API Banxico)").
- Al aceptar la sugerencia o corregir manualmente, la tarjeta desaparece con un *Fade-out*. Cuando no quedan tarjetas, se habilita el botón "Aprobar Pedimento".

### 5.2 Tabs de Datos Densos (Shadcn Tabs)
Agrupar los 300+ campos extraídos en pestañas:
1. **Encabezado:** Datos generales, incrementables, contribuciones.
2. **Facturas:** Acordeones por factura (Incoterms, monedas, etc.).
3. **Partidas:** Tabla editable tipo Excel. Al editar `Fracción Arancelaria`, validar formato (8 dígitos). *Si la Forma de Pago es 21 (Anexo 30), mostrar un Badge morado "Crédito IVA/IEPS"*.
4. **Identificadores y Materiales:** Sub-tablas dinámicas donde se puede agregar nuevas filas.

### 5.3 Barra Inferior (Action Bar)
- Sticky en la parte inferior de la pantalla.
- Contiene los botones **"Guardar Borrador"** y **"Aprobar y Escribir en InterXel"**.

---

## 6. MÓDULOS SECUNDARIOS

### 6.1 Dashboard
- Recharts para gráfica de Área (Tendencia de 30 días).
- Tarjetas de KPIs (Operaciones del Día, Valor en USD, Impuestos Pagados). Mostrar métricas comparativas con flechas verdes/rojas.
- Panel lateral de alertas "SLA en Riesgo" (Tabla compacta).

### 6.2 Catálogos (Materiales, Clientes, etc.)
- DataTables a pantalla completa. Paginación Server-side.
- Barra superior con Búsqueda, Filtros y botón "Importar Excel".
- **Importador Masivo:** Un `Sheet` (Drawer lateral de Shadcn) con 4 pasos: Dropzone -> Preview de datos -> Procesando -> Resumen de errores línea por línea.

### 6.3 Conciliación SAT
- Dropzone para subir la Glosa del SAT.
- Renderizar resumen: X sin discrepancias (Badge Verde), Y con discrepancias (Badge Rojo).
- Expandir tabla de discrepancias campo a campo (XelSync vs SAT) destacando celdas en rojo pálido donde los valores no hagan match.

---

## 7. INSTRUCCIÓN FINAL PARA EL DESARROLLADOR FRONTEND
No escatimes en calidad visual. El sistema trata con millones de dólares en importaciones. Todo padding, alineación y hover state debe sentirse **deliberado y perfectamente terminado**. Sigue las convenciones de Shadcn UI y Tailwind CSS para lograr el "look" de Vercel/Linear. Inicia la estructura base con Next.js App Router e implementa las páginas descritas usando mock data estructurado como se detalla antes de conectar con el backend.
