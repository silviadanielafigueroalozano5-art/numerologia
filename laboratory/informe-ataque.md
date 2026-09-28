---

# Informe de Pruebas de Vulnerabilidad y Seguridad en API REST

**Integrantes del equipo atacante (Andrea y Daniel, quienes nos auditaron):**

* Daniel Mauricio Vesga Tibaduiza
* Andrea Carolina Silva Macias

**API auditada (de Yurley Tatiana Gomez Aparicio y Silvia Daniela Figueroa Lozano):**

---

## Resumen de Ejecución

Durante la auditoría técnica se ejecutaron 14 pruebas de estrés y vectores de ataque sobre los endpoints de la API REST para evaluar el manejo de errores, la validación de entrada con `express-validator` y la integridad referencial en MongoDB/Mongoose.

### Métricas Generales

* **Ataques Defendidos:** 7 (#01, #02, #04, #06, #09, #10, #14)
* **Vulnerabilidades Detectadas:** 7 (#03, #05, #07, #08, #11, #12, #13)
* **Total de Vectores Evaluados:** 14

---

## Clasificación de Hallazgos por Severidad

### Crítico (Riesgo de corrupción de datos e integridad rota)

* **Ataque #05 (Enum inventado):** Permite guardar roles o estados no contemplados en las reglas del negocio.
* **Ataque #12 (Referencia a la nada):** Permite registrar lecturas/perfiles apuntando a un `usuario_id` que no existe.
* **Ataque #13 (Borrado sin cascada):** Elimina usuarios dejando documentos hijos huérfanos (`usuario_id` resuelve como `null` en `populate`).

### Grave (Falta de saneamiento y asignación masiva de atributos)

* **Ataque #03 (Coerción implícita de tipos):** Acepta números o booleanos en campos de texto/fecha sin lanzar error de tipo.
* **Ataque #07 (Mass Assignment en POST):** El controlador recibe `req.body` directo sin desestructurar o aplicar *whitelist*.
* **Ataque #08 (Mass Assignment en PUT):** Permite la inyección de atributos no autorizados durante la actualización.

### Menor (Formato e inconsistencia en respuestas HTTP)

* **Ataque #11 (Método/Ruta no implementada):** Responde con el HTML predeterminado de Express (`Cannot DELETE /...`) en lugar de un JSON estructurado.

---

## Detalle de Pruebas Ejecutadas

### Ataque #01: Omisión de Campos Obligatorios

* **Endpoint:** `POST /api/usuarios`
* **Estado:** **DEFENDIDO**
* **Body enviado:**
```json
{
  "nombre": "Prueba Incompleta"
}

```


* **Body recibido (HTTP 400 Bad Request):**
```json
{
    "mensaje": "Error de validación",
    "errores": [
        { "campo": "nombreCompleto", "mensaje": "El nombre completo es obligatorio" },
        { "campo": "nombreCompleto", "mensaje": "El nombre completo debe tener entre 3 y 100 caracteres" },
        { "campo": "email", "mensaje": "El correo electrónico es obligatorio" },
        { "campo": "email", "mensaje": "El correo electrónico no es válido" },
        { "campo": "passwordHash", "mensaje": "La contraseña es obligatoria" },
        { "campo": "passwordHash", "mensaje": "La contraseña debe tener mínimo 6 caracteres" },
        { "campo": "fechaNacimiento", "mensaje": "La fecha de nacimiento es obligatoria" },
        { "campo": "fechaNacimiento", "mensaje": "La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)" }
    ]
}

```


* **Análisis:** La capa middleware interceptó la solicitud mediante `express-validator`. Se retornaron los mensajes de error configurados para cada campo faltante, evitando llamadas al controlador o fallos directos desde la base de datos.

---

### Ataque #02: Payload Totalmente Vacío

* **Endpoint:** `POST /api/usuarios`
* **Estado:** **DEFENDIDO**
* **Body enviado:**
```json
{}

```


* **Body recibido (HTTP 400 Bad Request):**
```json
{
    "mensaje": "Error de validación",
    "errores": [
        { "campo": "nombreCompleto", "mensaje": "El nombre completo es obligatorio" },
        { "campo": "nombreCompleto", "mensaje": "El nombre completo debe tener entre 3 y 100 caracteres" },
        { "campo": "email", "mensaje": "El correo electrónico es obligatorio" },
        { "campo": "email", "mensaje": "El correo electrónico no es válido" },
        { "campo": "passwordHash", "mensaje": "La contraseña es obligatoria" },
        { "campo": "passwordHash", "mensaje": "La contraseña debe tener mínimo 6 caracteres" },
        { "campo": "fechaNacimiento", "mensaje": "La fecha de nacimiento es obligatoria" },
        { "campo": "fechaNacimiento", "mensaje": "La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)" }
    ]
}

```


* **Análisis:** El envío de un objeto JSON vacío fue capturado por las reglas de presencia de los esquemas de validación, respondiendo ordenadamente con una lista de los parámetros requeridos.

---

### Ataque #03: Inyección de Tipos de Datos Alterados

* **Endpoint:** `POST /api/usuarios`
* **Estado:** **VULNERABLE**
* **Body enviado:**
```json
{
  "nombreCompleto": 12345,
  "email": true,
  "passwordHash": 987654,
  "fechaNacimiento": 20260921
}

```


* **Body recibido (HTTP 400 Bad Request):**
```json
{
    "mensaje": "Error de validación",
    "errores": [
        {
            "campo": "email",
            "mensaje": "El correo electrónico no es válido"
        }
    ]
}

```


* **Análisis:** Aunque la API respondió con un `400`, el middleware solo rechazó el campo `email` por fallo de sintaxis `@`. Los datos de `nombreCompleto`, `passwordHash` y `fechaNacimiento` pasaron la validación al ser casteados o ignorados como tipos no válidos. Falta incluir encadenamientos explícitos como `.isString()` o `.isISO8601()`.

---

### Ataque #04: Cadenas compuestas únicamente por espacios

* **Endpoint:** `POST /api/usuarios`
* **Estado:** **DEFENDIDO**
* **Body enviado:**
```json
{
  "nombreCompleto": "   ",
  "email": "usuario@test.com",
  "passwordHash": "123456",
  "fechaNacimiento": "2000-01-01"
}

```


* **Body recibido (HTTP 400 Bad Request):**
```json
{
    "mensaje": "Error de validación",
    "errores": [
        { "campo": "nombreCompleto", "mensaje": "El nombre completo es obligatorio" },
        { "campo": "nombreCompleto", "mensaje": "El nombre completo debe tener entre 3 y 100 caracteres" }
    ]
}

```


* **Análisis:** El uso del sanitizador `.trim()` antes del chequeo de longitud impidió que el registro almacenara cadenas vacías compuestas solo por espacios en blanco.

---

### Ataque #05: Inyección de Valores fuera de Enum

* **Endpoint:** `POST /api/usuarios`
* **Estado:** **VULNERABLE**
* **Body enviado:**
```json
{
  "nombreCompleto": "Juan Perez",
  "email": "juan.enum@test.com",
  "passwordHash": "123456",
  "fechaNacimiento": "2000-01-01",
  "rol": "HACKER_SUPER_ADMIN"
}

```


* **Body recibido (HTTP 201 Created):**
```json
{
    "nombreCompleto": "Juan Perez",
    "email": "juan.enum@test.com",
    "passwordHash": "$2b$10$o3/svUg5W2I9eB4jfGL/beN8YJ5HWpywF5PEyH.brPqwV3JvQgkDu",
    "fechaNacimiento": "2000-01-01T00:00:00.000Z",
    "_id": "6ab14a5e36d26a59809a57a8",
    "fechaRegistro": "2026-09-21T15:16:46.258Z",
    "__v": 0
}

```


* **Análisis:** La API guardó la entidad omitiendo la verificación del campo `rol`. No se cuenta con una regla `.isIn([...])` en el validador ni con una restricción `enum` estricta a nivel de esquema en Mongoose para filtrar roles no autorizados.

---

### Ataque #06: Desbordamiento de Cadena de Texto

* **Endpoint:** `POST /api/usuarios`
* **Estado:** **DEFENDIDO**
* **Body enviado:**
```json
{
  "nombreCompleto": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "email": "texto.gigante@test.com",
  "passwordHash": "123456",
  "fechaNacimiento": "2000-01-01"
}

```


* **Body recibido (HTTP 400 Bad Request):**
```json
{
    "mensaje": "Error de validación",
    "errores": [
        {
            "campo": "nombreCompleto",
            "mensaje": "El nombre completo debe tener entre 3 y 100 caracteres"
        }
    ]
}

```


* **Análisis:** El middleware aplicó correctamente la restricción de longitud máxima (`.isLength({ max: 100 })`), deteniendo el procesamiento antes de impactar el almacenamiento.

---

### Ataque #07: Mass Assignment en Creación (POST)

* **Endpoint:** `POST /api/usuarios`
* **Estado:** **VULNERABLE**
* **Body enviado:**
```json
{
  "nombreCompleto": "Usuario Hacker",
  "email": "hacker.post@test.com",
  "passwordHash": "123456",
  "fechaNacimiento": "2000-01-01",
  "rol": "admin",
  "activo": false,
  "esAdmin": true
}

```


* **Body recibido (HTTP 201 Created):**
```json
{
    "nombreCompleto": "Usuario Hacker",
    "email": "hacker.post@test.com",
    "passwordHash": "$2b$10$n/xBUd64M./gCou58T6tmOoRLgWal9VvpkvZE75q9EfdU9GBmsFz2",
    "fechaNacimiento": "2000-01-01T00:00:00.000Z",
    "_id": "6ab14ada36d26a59809a57a9",
    "fechaRegistro": "2026-09-21T15:18:50.285Z",
    "__v": 0
}

```


* **Análisis:** El controlador pasó todo el `req.body` al método de creación de la base de datos sin filtrar propiedades no permitidas para el cliente. Es necesario desestructurar los argumentos requeridos de forma explícita.

---

### Ataque #08: Mass Assignment en Edición (PUT)

* **Endpoint:** `PUT /api/usuarios/6ab14ada36d26a59809a57a9`
* **Estado:** **VULNERABLE**
* **Body enviado:**
```json
{
  "nombreCompleto": "Usuario Hacker Modificado",
  "rol": "admin",
  "esAdmin": true,
  "activo": false
}

```


* **Body recibido (HTTP 200 OK):**
```json
{
    "_id": "6ab14ada36d26a59809a57a9",
    "nombreCompleto": "Usuario Hacker Modificado",
    "email": "hacker.post@test.com",
    "passwordHash": "$2b$10$n/xBUd64M./gCou58T6tmOoRLgWal9VvpkvZE75q9EfdU9GBmsFz2",
    "fechaNacimiento": "2000-01-01T00:00:00.000Z",
    "fechaRegistro": "2026-09-21T15:18:50.285Z",
    "__v": 0
}

```


* **Análisis:** De forma similar a la creación, el endpoint de modificación procesa campos administrativos sin aplicar listas blancas (*whitelisting*) sobre la carga recibida.

---

### Ataque #09: Búsqueda con Identificador con Formato Inválido

* **Endpoint:** `GET /api/usuarios/123abc`
* **Estado:** **DEFENDIDO**
* **Body enviado:** *(Sin body)*
* **Body recibido (HTTP 400 Bad Request):**
```json
{
    "mensaje": "Error de validación",
    "errores": [
        {
            "campo": "id",
            "mensaje": "El id proporcionado no es un ObjectId válido de MongoDB"
        }
    ]
}

```


* **Análisis:** El parámetro de la ruta fue auditado con `.isMongoId()`, respondiendo con una estructura `400` limpia y evitando un fallo crítico (`CastError` / 500) del ORM.

---

### Ataque #10: Búsqueda de Identificador Inexistente

* **Endpoint:** `GET /api/perfiles-numerologicos/6ab14ada36d26a59809a5799`
* **Estado:** **DEFENDIDO**
* **Body enviado:** *(Sin body)*
* **Body recibido (HTTP 404 Not Found):**
```json
{
    "mensaje": "Perfil numerológico no encontrado"
}

```


* **Análisis:** El formato del `ObjectId` fue válido, la consulta se realizó a MongoDB y, al no encontrar concordancias, el controlador devolvió la respuesta adecuada (`404`).

---

### Ataque #11: Invocación de Métodos no Soportados

* **Endpoint:** `DELETE /api/auth/login`
* **Estado:** **VULNERABLE**
* **Body enviado:** *(Sin body)*
* **Body recibido (HTTP 404 Not Found - Content-Type: text/html):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Error</title>
</head>
<body>
    <pre>Cannot DELETE /api/auth/login</pre>
</body>
</html>

```


* **Análisis:** La ruta/método no configurado cayó en el manejador básico de Express, devolviendo una página HTML (`<pre>Cannot DELETE /api/auth/login</pre>`). Debe implementarse un middleware final que capture rutas no mapeadas y retorne la respuesta estandarizada en formato JSON.

---

### Ataque #12: Referencia a Recursos Inexistentes (Llave Foránea Huérfana)

* **Endpoint:** `POST /api/lecturas`
* **Estado:** **VULNERABLE**
* **Body enviado:**
```json
{
  "usuario_id": "60c72b2f9b1d8b2b88888888",
  "prompt": "Generar lectura anual de numerología",
  "respuesta": "Tu año personal es el número 7.",
  "tipoLectura": "anual"
}

```


* **Body recibido (HTTP 201 Created):**
```json
{
    "usuario_id": "60c72b2f9b1d8b2b88888888",
    "prompt": "Generar lectura anual de numerología",
    "respuesta": "Tu año personal es el número 7.",
    "tipoLectura": "anual",
    "_id": "6ab14d2f36d26a59809a57ab",
    "fecha": "2026-09-21T15:28:47.867Z",
    "__v": 0
}

```


* **Análisis:** Se permitió insertar un registro con una clave `usuario_id` válida en estructura pero sin correspondencia real en la colección `usuarios`. Falta incluir una consulta previa de verificación en el validador o controlador.

---

### Ataque #13: Eliminación de Entidades Padre con Dependencias

* **Endpoint:** `DELETE /api/usuarios/6a8c3caef60cdc5ca7f59b7d`
* **Estado:** **VULNERABLE**
* **Body enviado:** *(Sin body)*
* **Body recibido (HTTP 200 OK):**
```json
{
    "mensaje": "Usuario eliminado correctamente"
}

```


* **Análisis:** La API eliminó el usuario sin validar si este contaba con lecturas o perfiles asociados. Al ejecutar consultas posteriores con `.populate()`, los documentos hijos apuntan a referencias nulas. Se requiere lógica de borrado en cascada o restricción previa.

---

### Ataque #14: Actualización Parcial mediante PUT

* **Endpoint:** `PUT /api/usuarios/6ab14ada36d26a59809a57a9`
* **Estado:** **DEFENDIDO**
* **Body enviado:**
```json
{
  "nombreCompleto": "Solo Nombre Actualizado"
}

```


* **Body recibido (HTTP 200 OK):**
```json
{
    "_id": "6ab14ada36d26a59809a57a9",
    "nombreCompleto": "Solo Nombre Actualizado",
    "email": "hacker.post@test.com",
    "passwordHash": "$2b$10$n/xBUd64M./gCou58T6tmOoRLgWal9VvpkvZE75q9EfdU9GBmsFz2",
    "fechaNacimiento": "2000-01-01T00:00:00.000Z",
    "fechaRegistro": "2026-09-21T15:18:50.285Z",
    "__v": 0
}

```


* **Análisis:** El endpoint actualizó únicamente la propiedad provista, manteniendo intactas las demás propiedades de la entidad (`email`, `passwordHash`, `fechaNacimiento`) gracias a la aplicación nativa del operador `$set` en Mongoose.