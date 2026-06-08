# PROMPT DE CONEXIÓN FRONTEND-BACKEND (XelSync AI)
**Objetivo:** Instruir a la IA asistente (o al desarrollador Frontend) sobre las convenciones exactas para conectar la app Next.js con el backend FastAPI de XelSync AI.

---

## 1. CONTEXTO DE LA API Y ENTORNO
El backend está construido en **FastAPI (Python)** y corre localmente en `http://localhost:8000`. Todas las rutas de la API comienzan con el prefijo `/api/v1`. 

* **Variable de Entorno Base:** Configurar `NEXT_PUBLIC_API_URL` en el archivo `.env.local` apuntando a `http://localhost:8000`.
* **Swagger/OpenAPI:** Existe documentación interactiva del backend en `http://localhost:8000/docs`. Se recomienda fuertemente revisar el "Response Schema" ahí si hay dudas de tipos exactos.

## 2. AXIOS E INTERCEPTORES (REGLA DE ORO)
Toda la comunicación hacia la API debe hacerse usando una instancia configurada de `axios`.

### Implementación Requerida:
1. Crea un archivo `lib/api.ts` o `services/api.ts`.
2. Define la instancia: `const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });`
3. **Interceptor de Solicitudes (Request):** Antes de cada llamada, el interceptor debe buscar el Token JWT (ej. `localStorage.getItem('access_token')` o en las cookies o store de Zustand) e inyectarlo en los headers: `Authorization: Bearer <TOKEN>`.
4. **Interceptor de Respuestas (Response):** Debe atrapar globalmente errores `401 Unauthorized` para desloguear al usuario automáticamente y redirigirlo a `/login`.

## 3. AUTENTICACIÓN (LOGIN)
El endpoint de login de FastAPI espera un formato de formulario (`application/x-www-form-urlencoded`) según el estándar OAuth2, **NO** un JSON. 

* **Endpoint:** `POST /api/v1/auth/login`
* **Content-Type:** `application/x-www-form-urlencoded`
* **Body requerido:** `username` (email) y `password`.
* **Respuesta Esperada:** `{ "access_token": "ey...", "token_type": "bearer", "rol": "ADMIN" }`

**Nota:** Una vez que obtienes el `access_token`, guárdalo (Zustand/Cookie/Storage) para que el interceptor de Axios lo comience a usar de inmediato en el resto de la aplicación.

## 4. FLUJO ASÍNCRONO DE EXTRACCIÓN (Subida de PDF)
El backend procesa los PDFs usando un Worker de Celery en segundo plano. Esto significa que la subida del archivo no devuelve la respuesta inmediata, sino un `task_id` o `archivo_id` que debes monitorear.

### Paso 1: Subida de Archivo (Multipart)
* **Endpoint:** `POST /api/v1/extraccion/upload`
* **Formato:** `multipart/form-data`. Usa `FormData` nativo del navegador.
* **Header:** ¡Asegúrate de NO forzar el content-type, deja que el navegador establezca los "boundaries" automáticamente!

### Paso 2: Polling Inteligente (SWR o setInterval)
Al recibir el `archivo_id` tras subir el archivo, debes consultar el progreso:
* **Endpoint:** `GET /api/v1/extraccion/status/{archivo_id}`
* **Lógica:** Haz una llamada (polling) cada 2 a 3 segundos a este endpoint.
* **Respuesta:** `{ "estado": "EXTRAYENDO", "progreso": 45, "tracking_id": "uuid-123" }`
* **Comportamiento Visual:** Muestra una barra de progreso que se actualice con la variable `progreso`.
* **Finalización:** Si `estado === "COMPLETADO"`, el polling debe detenerse inmediatamente. Usa el `tracking_id` devuelto para redirigir al usuario a la vista de revisión: `router.push('/pedimentos/{tracking_id}/revision')`.

## 5. CAPTURA Y MANEJO DE ERRORES BUBBLING (422 Unprocessable Entity)
FastAPI es estricto con los esquemas gracias a Pydantic. Si envías un tipo de dato equivocado (por ejemplo, un string en un campo que es int), lanzará un error `422`.
* Tu frontend siempre debe capturar los bloques `try/catch` de las llamadas API.
* Muestra al usuario notificaciones emergentes (Toasts de Shadcn) leyendo específicamente la llave `error.response.data.detail`.

¡Siguiendo al pie de la letra estas directrices, la comunicación entre el Front de Next.js y el Back de FastAPI será completamente nativa, fluida y sin problemas de CORS ni de Autorización!
