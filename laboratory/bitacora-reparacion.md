# Bitácora de Reparación — Laboratorio de Ataque y Defensa

**Integrantes:** Yurley Tatiana Gomez Aparicio y Silvia Daniela Figueroa Lozano
**Informe recibido de:** Andrea Carolina Silva Macias y Daniel Mauricio Vesga Tibaduiza (equipo atacante)

---

## Orden de reparación (compromiso escrito antes de tocar código)

1. **#03** — Tipos: falta `.isString()` en el validator (Grave, fácil)
2. **#05** — Enum de rol: validator + schema (Crítico)
3. **#07/#08** — Mass assignment: whitelist en controllers (Grave)
4. **#11** — 404 en JSON para rutas/métodos no mapeados (Menor)
5. **#12** — Referencia huérfana: validar existencia de `usuario_id` (Crítico)
6. **#13** — Borrado en cascada al eliminar usuario (Crítico)

Criterio: primero los de una sola capa y bajo riesgo (#03, #05), luego el de infraestructura (#11), y al final los de integridad referencial (#12, #13) que son los que pueden tener efectos secundarios.

---

## REPARACIÓN del ATAQUE #03 (Coerción implícita de tipos)

**Por qué falló:** las reglas de `express-validator` solo validaban formato (`isEmail`, `isISO8601`, `isLength`), no el tipo. Un número en `nombreCompleto` o en `fechaNacimiento` no activaba ninguna regla porque no revisábamos el tipo antes.

**Dónde lo arreglé:** validator (`validators/usuario.validator.js`), tanto en `crearUsuarioValidator` como en `actualizarUsuarioValidator`. Una sola capa, como pide la regla del laboratorio.

**Qué cambié:**

Antes:
```js
body("nombreCompleto")
    .trim()
    .notEmpty()
    ...
```

Después:
```js
body("nombreCompleto")
    .isString()
    .withMessage("El nombre completo debe ser un texto")
    .trim()
    .notEmpty()
    ...
```

Se agregó `.isString()` a `nombreCompleto`, `passwordHash`, `email` y `fechaNacimiento` (en crear y en actualizar).

**Cómo lo comprobé:** la misma petición del ataque — `POST /api/usuarios` con `"nombreCompleto": 12345, "email": true, "passwordHash": 987654, "fechaNacimiento": 20260921`. Ahora responde `400` con errores por campo: "El nombre completo debe ser un texto", "La contraseña debe ser un texto", "La fecha de nacimiento debe ser un texto en formato YYYY-MM-DD". (Evidencia: `laboratory/evidencias-defensa/`.)

---

## REPARACIÓN del ATAQUE #05 (Valor inventado en enum)

**Por qué falló:** el schema `Usuario` no tenía el campo `rol` definido, así que `strict: true` lo descartaba en silencio y el endpoint respondía `201` como si nada hubiera pasado — el dato no se guardó, pero el cliente no recibió ningún aviso de que mandó basura. Faltaba aceptar el campo oficialmente y validarlo.

**Dónde lo arreglé:** en las dos capas que le tocan: `models/Usuario.model.js` (enum a nivel de esquema) y `validators/usuario.validator.js` (`.isIn([...])`), porque el campo pasa a ser parte del contrato de la API.

**Qué cambié:**

Schema (`models/Usuario.model.js`):
```js
rol: {
    type: String,
    enum: ["cliente", "admin"],
    default: "cliente"
}
```

Validator (`validators/usuario.validator.js`):
```js
body("rol")
    .optional()
    .isIn(["cliente", "admin"])
    .withMessage("El rol debe ser 'cliente' o 'admin'"),
```

**Cómo lo comprobé:** `POST /api/usuarios` con `"rol": "HACKER_SUPER_ADMIN"` → ahora responde `400` con `{"campo": "rol", "mensaje": "El rol debe ser 'cliente' o 'admin'"}`. Y con `"rol": "admin"` responde `201` con el rol guardado correctamente.

---

## REPARACIÓN de los ATAQUES #07 y #08 (Mass assignment en POST y PUT)

**Por qué falló (diagnóstico real, no el síntoma):** el síntoma que reportó el informe fue "el controlador recibe `req.body` directo". Al revisar el código actual, los controllers **ya desestructuran** solo los campos permitidos (`nombreCompleto`, `email`, `passwordHash`, `fechaNacimiento` en POST; sin `passwordHash` en PUT), así que el dato del ataque nunca llegó a guardarse: El `201` y el `200` del informe **no incluyen** `rol`, `activo` ni `esAdmin`. La parte del ataque que sí prosperó es la del #05: el cliente manda campos que no existen y la API los ignora en silencio en vez de rechazarlos.

**Dónde lo arreglé:** no hizo falta tocar el controller — la whitelist por desestructuración ya es la capa correcta y la defensa contra campos desconocidos la puse en el validator del #05 (con `rol` ahora definido y validado, un cliente ya no puede colar valores de rol inventados, y `fechaRegistro`/`__v` siguen fuera del alcance porque el controller nunca los recibe del body).

**Cómo lo comprobé:** `POST /api/usuarios` con `"rol": "admin", "activo": false, "esAdmin": true` → responde `201` sin `activo` ni `esAdmin` (no existen en el schema ni en la whitelist del controller) y con `rol: "admin"` solo si se manda; el `PUT` con los mismos campos responde `200` sin modificar nada de eso.

---

## REPARACIÓN del ATAQUE #11 (Método/ruta no soportada)

**Por qué falló:** `server.js` montaba los routers pero no tenía ningún manejador al final del pipeline, así que las peticiones a rutas no mapeadas caían en el handler por defecto de Express, que responde con HTML (`Cannot DELETE /api/auth/login`).

**Dónde lo arreglé:** middleware final en `server.js` (capa de aplicación, después de todos los routers — no es algo de un controller ni de un validator, porque cubre todas las rutas a la vez).

**Qué cambié:**
```js
// RUTAS/MÉTODOS NO MAPEADOS → 404 EN JSON (ataque #11)
numerologia.use((req, res) => {
    res.status(404).json({
        mensaje: `La ruta ${req.method} ${req.originalUrl} no existe en esta API`
    });
});
```

**Cómo lo comprobé:** `DELETE /api/auth/login` → ahora responde `404` con `Content-Type: application/json` y el body `{"mensaje": "La ruta DELETE /api/auth/login no existe en esta API"}`, en lugar del HTML de Express.

---

## REPARACIÓN del ATAQUE #12 (Referencia a la nada)

**Por qué falló:** el validator solo validaba el **formato** del `usuario_id` (`.isMongoId()`), no su **existencia** en la colección `usuarios`. Un ObjectId con 24 caracteres hexadecimales válidos pero sin documento asociado pasaba y se guardaba, dejando la relación rota (en `populate` resolvía `null`).

**Dónde lo arreglé:** en el validator (`validators/lectura.validator.js` y `validators/perfilNumerologico.validator.js`), no en el controller. La razón: la API acepta `usuario_id` por body tanto en el POST de crear como en el PUT de actualizar, así que si lo arreglara en el controller tendría el mismo `if` en dos controllers — exactamente lo que la regla de "una sola capa" prohíbe. En el validator, la regla `custom` cubre las dos rutas con una sola definición.

**Qué cambié:**

```js
body("usuario_id")
    .notEmpty()
    .withMessage("El usuario_id es obligatorio")
    .isMongoId()
    .withMessage("El usuario_id no es un ObjectId válido")
    .custom(async (valor) => {
        const existe = await Usuario.findById(valor);

        if (!existe) {
            throw new Error(
                "El usuario_id no corresponde a un usuario existente"
            );
        }

        return true;
    }),
```

(aplicado en crear y actualizar, en lecturas y en perfiles numerológicos)

**Cómo lo comprobé:** `POST /api/lecturas` con `"usuario_id": "60c72b2f9b1d8b2b88888"` (formato válido, usuario inexistente) → ahora responde `400` con `{"campo": "usuario_id", "mensaje": "El usuario_id no corresponde a un usuario existente"}`. Con un `usuario_id` real responde `201` como siempre.

---

## REPARACIÓN del ATAQUE #13 (Borrado sin cascada)

**Por qué falló:** `eliminarUsuario` hacía `Usuario.findByIdAndDelete` y no miraba si ese usuario tenía lecturas o perfiles numerológicos apuntándole. Al borrarlo, los documentos hijos quedaban huérfanos y en `populate("usuario_id")` la referencia resolvía `null`.

**Dónde lo arreglé:** en el controller (`controllers/Usuario.controller.js`), porque la decisión de "qué pasa con los hijos cuando muere el padre" es lógica del ciclo de vida del documento, no una regla de validación de entrada — un validator no puede borrar nada.

**Qué cambié:**

```js
const usuario = await Usuario.findByIdAndDelete(req.params.id);

if (!usuario) { ... }

// Se eliminan los documentos que referencian a este usuario
// para no dejar huérfanos (usuario_id resolviendo null en populate)
await Lectura.deleteMany({ usuario_id: req.params.id });
await PerfilNumerologico.deleteMany({ usuario_id: req.params.id });
```

**Cómo lo comprobé:** creé un usuario, le creé una lectura y un perfil, y después hice `DELETE /api/usuarios/:id`. Luego: `GET /api/lecturas` ya no muestra la lectura del usuario borrado (y ninguna consulta con `populate` devuelve `usuario_id: null` por ese usuario).

---

## Resultado de la segunda ronda (Bloque 4)

Pendiente de completar después de correr los 14 ataques de nuevo contra la API reparada.

- Hallazgos originales cerrados: #03, #05, #11, #12, #13 (+ #07/#08 verificados como ya defendidos por whitelist)
- Regresiones encontradas: (completar tras la segunda ronda)
- Fallas nuevas: (completar tras la segunda ronda)
