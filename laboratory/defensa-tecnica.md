# Defensa Técnica — Laboratorio de Ataque y Defensa

**Integrantes:**

* Yurley Tatiana Gomez Aparicio
* Silvia Daniela Figueroa Lozano

**Proyecto:** API REST de Numerología (Express + Mongoose + express-validator)

> Todas las respuestas citan código propio del repo. Las rutas son relativas a la raíz del proyecto (`astrologia/`).

---

## 1. Pega una regla de tu validator y dime cuál de los 14 ataques bloquea

Archivo: `validators/lectura.validator.js` (líneas 34–38)

```js
body("tipoLectura")
    .notEmpty()
    .withMessage("El tipo de lectura es obligatorio")
    .isIn(["diaria", "general", "anual"])
    .withMessage("El tipo de lectura no es válido"),
```

**Esta regla bloquea el Ataque #05** (valor inventado en un enum), al menos para el campo `tipoLectura` de las lecturas. Para el `rol` de usuario la situación era distinta y la cuento abajo, en la pregunta 5.

Si un cliente manda `POST /api/lecturas` con `"tipoLectura": "HACKER_SUPER_LECTURA"`, el middleware `validarCampos` corta la petición antes de que llegue al controller y responde:

```json
{
    "mensaje": "Error de validación",
    "errores": [
        { "campo": "tipoLectura", "mensaje": "El tipo de lectura no es válido" }
    ]
}
```

con código `400`. Sin `.isIn([...])`, el valor llegaría a la base de datos y ahí lo atraparía el `enum` del schema de Mongoose, pero con un error mucho menos claro para el cliente.

Otra regla que puedo citar es la del id en `validators/usuario.validator.js` (líneas 108–114):

```js
export const idValidator = [
    param("id")
        .isMongoId()
        .withMessage(
            "El id proporcionado no es un ObjectId válido de MongoDB"
        ),
];
```

Esta es la que bloqueó el **Ataque #09**: `GET /api/usuarios/123abc` respondió `400` con ese mensaje en vez de dejar pasar al controller y provocar un `CastError` de Mongoose (un 500). Es una regla sobre `param()`, no sobre `body()`, lo que muestra que la validación no cubre solo el body sino también la ruta.

---

## 2. Caso donde express-validator Y el schema de Mongoose rechazan lo mismo: ¿repetir por repetir o defensa en capas?

**Caso concreto en mi API:** el campo `fechaNacimiento` de usuario.

Capa 1 — validator (`validators/usuario.validator.js`, líneas 41–49):

```js
body("fechaNacimiento")
    .notEmpty()
    .withMessage("La fecha de nacimiento es obligatoria")
    .isISO8601()
    .withMessage(
        "La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)"
    )
```

Capa 2 — schema (`models/Usuario.model.js`, líneas 20–23):

```js
fechaNacimiento: {
    type: Date,
    required: true
},
```

Si mando `"fechaNacimiento": "no-soy-una-fecha"`, **las dos capas lo rechazan**: el validator con un `400` con mensaje claro, y el schema con un `CastError` de Mongoose (que sin la capa 1 llegaría como un 500 con texto interno).

**Mi respuesta con lo que vi hoy: no es repetir por repetir, es defensa en capas, y las capas no protegen lo mismo.**

Lo que pasó en el laboratorio me lo demostró:

- En el **Ataque #03** mi validator dejó pasar `"fechaNacimiento": 20260921` (un número) porque solo revisaba *formato de string* con `.isISO8601()` y no el *tipo*. En ese caso fue el `type: Date` del schema lo que evitó que se guardara basura: la segunda capa atrapó lo que la primera dejó pasar. Si la capa del schema no existiera, el dato corrupto se habría guardado.
- El `required: true` del schema también protege rutas que no pasan por ese validator. En mi `actualizarUsuarioValidator` los campos son `.optional()`, así que si alguien se salta el validator (por ejemplo, añadiendo una ruta nueva y olvidando el middleware), el schema sigue exigiendo que `fechaNacimiento` sea una fecha válida.

La diferencia práctica que vi: el validator rechaza **antes** de tocar la base de datos y con un mensaje en español que el cliente entiende; el schema es la última línea de defensa que responde con errores crudos de Mongoose. Por eso el orden correcto es que la capa 1 rechace casi todo, y la capa 2 sea el seguro por si algo se escapa.

---

## 3. Ataque #12: qué hizo mi API y qué decidí

**Qué hizo mi API.** En `controllers/lectura.controller.js` (líneas 37–48) el controller recibe el `usuario_id` y lo guarda sin preguntar si existe:

```js
export const crearLectura = async (req, res) => {
    try {
        const lectura = new Lectura({
            usuario_id: req.body.usuario_id,
            prompt: req.body.prompt,
            respuesta: req.body.respuesta,
            tipoLectura: req.body.tipoLectura
        });

        await lectura.save();

        res.status(201).json(lectura);
    } catch (error) { ... }
};
```

Y la única protección previa era en `validators/lectura.validator.js` (líneas 7–11):

```js
body("usuario_id")
    .notEmpty()
    .withMessage("El usuario_id es obligatorio")
    .isMongoId()
    .withMessage("El usuario_id no es un ObjectId válido"),
```

Es decir: valido la **forma** del ObjectId (que tenga 24 caracteres hexadecimales), pero no su **existencia**. Por eso el ataque con `"usuario_id": "60c72b2f9b1d8b2b88888888"` respondió `201 Created`: el id tiene formato correcto pero no apunta a ningún documento de la colección `usuarios`.

Además, mi `obtenerLecturas` usa `.populate("usuario_id")`:

```js
const lecturas = await Lectura.find()
    .populate("usuario_id");
```

Con una referencia huérfana, ese campo poblado resuelve como `null`: la corrupción no se ve al insertar sino al consultar después.

**Qué decidí y por qué.** Como ni `express-validator` solo (no tiene regla de existencia) ni el schema de Mongoose solo (un `ref` no valida existencia por defecto) resuelven esto, la responsabilidad la pusimos en **una regla `custom` del validator**, porque es validación de negocio de entrada, no lógica del CRUD:

```js
body("usuario_id")
    .isMongoId()
    .custom(async (valor) => {
        const existe = await Usuario.findById(valor);
        if (!existe) {
            throw new Error("El usuario_id no corresponde a un usuario existente");
        }
        return true;
    })
```

El argumento de por qué ahí y no en el controller: el proyecto ya tiene el patrón validator → `validarCampos` → controller en **todas** las rutas (`routes/lectura.routes.js`, líneas 38–43). Si lo pusiéramos en el controller de crear, mañana habría que copiar el mismo `if` en el de actualizar (que también recibe `usuario_id` por body, en `actualizarLecturaValidator`, líneas 44–60 del validator). Ponerlo en el validator es una sola capa que cubre las dos rutas, que es exactamente lo que pide el laboratorio con lo de "cada falla se arregla en una sola capa".

Elegimos rechazar el insert porque es más barato (una consulta extra en POST) y no destruye lecturas que podrían ser históricas. La otra opción era borrar en cascada en `DELETE /api/usuarios/:id`, que igual aplicamos para cubrir el ataque #13, pero como decisión de protección del POST preferimos el rechazo temprano.

---

## 4. Ataque #14: qué pasó realmente y por qué

**Lo que comprobé.** Mandé un `PUT` a un usuario que tiene cinco campos con **un solo campo**:

```json
{ "nombreCompleto": "Solo Nombre Actualizado" }
```

y la respuesta fue `200` con el documento **completo**: `email`, `passwordHash`, `fechaNacimiento` y `fechaRegistro` siguen ahí, intactos.

**Por qué.** Mi controller (`controllers/Usuario.controller.js`, líneas 73–92) hace esto:

```js
const {
    nombreCompleto,
    email,
    fechaNacimiento
} = req.body;

const usuario = await Usuario.findByIdAndUpdate(
    req.params.id,
    {
        nombreCompleto,
        email,
        fechaNacimiento
    },
    {
        new: true,
        runValidators: true
    }
);
```

Aquí pasó una cosa que al principio me confundió y que es la clave de la pregunta: al desestructurar `req.body`, los campos que **no vinieron** quedan como `undefined`, no como "ausentes". Entonces el objeto de update literalmente contiene `email: undefined`. Si eso llegara tal cual a MongoDB, borraría los campos.

Lo que impide el borrado es el comportamiento de **Mongoose con los valores `undefined`**: cuando Mongoose construye la operación de update, descarta las propiedades cuyo valor es `undefined`. El update que realmente llega a MongoDB es:

```
{ $set: { nombreCompleto: "Solo Nombre Actualizado" } }
```

y MongoDB con `$set` **solo modifica los campos que aparecen en la operación**, dejando el resto intacto. No es que MongoDB "sepa" que era un PUT parcial: es la combinación de (1) Mongoose descartando los `undefined` de mi desestructuración y (2) `$set` tocando únicamente lo que recibe.

La distinción fina que comprobé: esto pasa con `undefined`, no con `null`. Si el cliente manda explícitamente `"email": null` o `"email": ""`, el campo sí viene definido y se sobrescribe. Es la diferencia entre "el campo no vino" (`undefined`, Mongoose lo descarta) y "el campo vino con un valor vacío" (se escribe).

---

## 5. Pega el pedazo de código donde impides el mass assignment y explica por qué el `strict: true` de Mongoose no basta

**El código donde lo impido** es la desestructuración en los controllers. En `controllers/Usuario.controller.js` (líneas 5–21), para POST:

```js
const {
    nombreCompleto,
    email,
    passwordHash,
    fechaNacimiento
} = req.body;

const passwordEncriptada = await bcrypt.hash(passwordHash, 10);

const usuario = await Usuario.create({
    nombreCompleto,
    email,
    passwordHash: passwordEncriptada,
    fechaNacimiento
});
```

Y para PUT (líneas 73–92, citado arriba): solo `nombreCompleto`, `email` y `fechaNacimiento` entran al update. Nótese que en PUT **ni siquiera** acepto `passwordHash`: cambiar la contraseña no es editar el perfil, y esa ruta no hashea con bcrypt antes de guardar, así que aceptarla permitiría guardar una contraseña en texto plano.

**Por qué `strict: true` no bastaba.** El ataque #07 mandó `"rol": "admin", "activo": false, "esAdmin": true` y el informe lo marcó como vulnerable. Lo que de verdad pasaba con `strict: true` (que es el default de Mongoose): los campos que **no existían en el schema** — como `activo` o `esAdmin` en el `usuarioSchema` — se descartaban en silencio, y por eso el `201` devuelto no los incluía. En ese caso concreto `strict` sí salvó los datos. Lo que no salvaba era el `rol`, que hasta ayer ni existía en el schema y por eso la API aceptaba cualquier cosa sin rechazarla (el ataque #05); eso lo arreglamos agregando `rol` con `enum: ["cliente", "admin"]` al schema y `.isIn([...])` en el validator, como cuenta la bitácora.

Pero incluso con `strict`, no es una defensa suficiente contra mass assignment, por tres razones que salen de nuestro propio código:

1. **`strict` solo filtra campos que no están en el schema.** Si mañana, de forma legítima, agregamos `activo` al `usuarioSchema` (algo natural en un proyecto con auth), ese campo pasa a ser "conocido" y `strict` lo acepta desde el body sin rechistar. La defensa por desestructuración sigue funcionando igual, porque solo pasa al modelo los campos que nosotros decidimos.
2. **Campos gestionados por el servidor quedan expuestos si no filtras.** `fechaRegistro` está en el schema con `default: Date.now` (líneas 25–28). Si se aceptara `req.body` completo, un cliente podría mandar `"fechaRegistro": "1999-01-01"` y, al estar en el schema, `strict` no lo bloquearía: falsificaría la fecha de registro. Con la desestructuración, ese campo simplemente no existe en el objeto que se le pasa a `Usuario.create`.
3. **Con valores calculados la técnica es obligatoria.** Se hashea la contraseña antes de guardar (`bcrypt.hash(passwordHash, 10)`). Si se pasara `req.body` directo habría que mutar el body (`req.body.passwordHash = hash`), que es el patrón frágil; con la desestructuración se construye un objeto nuevo donde `passwordHash` recibe el hash, no lo que mandó el cliente.

Es decir: `strict: true` es una red de seguridad contra campos desconocidos, no una política de qué campos puede decidir el cliente. La política explícita (whitelist por desestructuración) es la que nosotros controlamos y la que sobrevive a cambios del schema.

---

## 6. ¿Cuál falla te costó más entender y qué te confundió al principio?

La que más nos costó fue el **Ataque #12 (la referencia a la nada)**, y de ahí salió parte de la respuesta de la pregunta 3.

Lo que nos confundió al principio: el validator **sí** tenía una regla para `usuario_id` (`.isMongoId()`), así que nuestra primera reacción fue "esto ya está defendido, el informe está equivocado". Tardamos en ver la diferencia entre dos preguntas distintas:

- ¿El valor tiene **formato** de ObjectId? → eso lo responde `.isMongoId()` y mi API lo hace bien (el ataque #09 con `123abc` sí dio 400).
- ¿El ObjectId **existe** en la otra colección? → eso no lo responde ninguna regla de formato, porque la respuesta está en la base de datos, no en el string.

La evidencia nos lo dejó claro: `60c72b2f9b1d8b2b88888888` pasa el `isMongoId()` (24 caracteres hexadecimales), responde `201`, y solo cuando fuimos a hacer el `GET` con `.populate("usuario_id")` vimos el efecto real: el campo poblado salía `null`. La corrupción no se veía en el POST, que es por lo que el informe la clasificó de crítica y no de grave: el dato malo entra sin hacer ruido y revienta después, en otra consulta.

La segunda parte que me confundió fue decidir **dónde** arreglarlo. Mi primer instinto fue poner un `if (await Usuario.findById(...))` dentro del controller de crear lecturas, pero al mirar el `actualizarLecturaValidator` me di cuenta de que acepta `usuario_id` por body también (líneas 44–60 del validator), así que íbamos a terminar con la misma verificación en dos controllers — exactamente lo que la regla de "una sola capa" prohíbe. Subir la verificación a un `.custom()` del validator resuelve eso: una sola regla, dos rutas cubiertas, y el controller queda limpio de lógica de negocio.

---

## Referencia cruzada rápida con el informe recibido

Esta tabla la escribimos al recibir el informe. Después del Bloque 3, todos estos puntos quedaron reparados (ver `bitacora-reparacion.md`); la dejamos como quedó el estado inicial de nuestro código para que se vea el antes/después.

| Ataque | Veredicto del informe | Estado en nuestro código al recibir el informe |
|---|---|---|
| #03 tipos | VULNERABLE | El validator aceptaba tipos no-string en `nombreCompleto`/`passwordHash` (faltaba `.isString()`); en fecha lo mitigaba el `type: Date` del schema |
| #05 enum | VULNERABLE | `rol` no existía en el schema (strict lo descartaba), pero la API respondía 201 en vez de rechazar; `tipoLectura` sí tenía `.isIn()` |
| #07/#08 mass assignment | VULNERABLE | Los controllers ya desestructuraban (whitelist), ver pregunta 5 |
| #11 método no soportado | VULNERABLE | `server.js` no tenía middleware catch-all de 404 en JSON |
| #12 referencia huérfana | VULNERABLE | El validator solo validaba formato, no existencia; ver pregunta 3 |
| #13 borrado sin cascada | VULNERABLE | `eliminarUsuario` no consultaba lecturas/perfiles dependientes |
