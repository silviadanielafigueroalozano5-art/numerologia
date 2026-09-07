import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";

import {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario
} from "../controllers/Usuario.controller.js";

import {
    crearUsuarioValidator,
    actualizarUsuarioValidator,
    idValidator
} from "../validators/usuario.validator.js";

import { validarCampos } from "../middlewares/validarCampos.js";

const router = Router();

// CREAR
router.post(
    "/",
    crearUsuarioValidator,
    validarCampos,
    crearUsuario
);

// LISTAR
router.get(
    "/",
    obtenerUsuarios
);

// OBTENER POR ID
router.get(
    "/:id",
    idValidator,
    validarCampos,
    validarJWT,
    obtenerUsuario
);

// ACTUALIZAR
router.put(
    "/:id",
    [...idValidator, ...actualizarUsuarioValidator],
    validarCampos,
    actualizarUsuario
);

// ELIMINAR
router.delete(
    "/:id",
    idValidator,
    validarCampos,
    eliminarUsuario
);

export default router;