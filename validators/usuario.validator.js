import { body, param } from "express-validator";
import Usuario from "../models/Usuario.model.js";

// REGLAS PARA CREAR UN USUARIO
export const crearUsuarioValidator = [
    body("nombreCompleto")
        .isString()
        .withMessage("El nombre completo debe ser un texto")
        .trim()
        .notEmpty()
        .withMessage("El nombre completo es obligatorio")
        .isLength({ min: 3, max: 100 })
        .withMessage("El nombre completo debe tener entre 3 y 100 caracteres"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("El correo electrónico es obligatorio")
        .isEmail()
        .withMessage("El correo electrónico no es válido")
        .custom(async (valor) => {
            const existe = await Usuario.findOne({ email: valor });

            if (existe) {
                throw new Error(
                    "Ya existe un usuario registrado con ese correo"
                );
            }

            return true;
        }),

    body("passwordHash")
        .isString()
        .withMessage("La contraseña debe ser un texto")
        .notEmpty()
        .withMessage("La contraseña es obligatoria")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener mínimo 6 caracteres"),

    body("fechaNacimiento")
        .isString()
        .withMessage("La fecha de nacimiento debe ser un texto en formato YYYY-MM-DD")
        .notEmpty()
        .withMessage("La fecha de nacimiento es obligatoria")
        .isISO8601()
        .withMessage(
            "La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)"
        )
        .custom((valor) => {
            if (new Date(valor) > new Date()) {
                throw new Error(
                    "La fecha de nacimiento no puede ser futura"
                );
            }

            return true;
        }),

    body("rol")
        .optional()
        .isIn(["cliente", "admin"])
        .withMessage("El rol debe ser 'cliente' o 'admin'"),
];


// REGLAS PARA ACTUALIZAR UN USUARIO
export const actualizarUsuarioValidator = [
    body("nombreCompleto")
        .optional()
        .isString()
        .withMessage("El nombre completo debe ser un texto")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage(
            "El nombre completo debe tener entre 3 y 100 caracteres"
        ),

    body("email")
        .optional()
        .isString()
        .withMessage("El correo electrónico debe ser un texto")
        .trim()
        .isEmail()
        .withMessage("El correo electrónico no es válido"),

    body("fechaNacimiento")
        .optional()
        .isString()
        .withMessage("La fecha de nacimiento debe ser un texto en formato YYYY-MM-DD")
        .isISO8601()
        .withMessage(
            "La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)"
        )
        .custom((valor) => {
            if (new Date(valor) > new Date()) {
                throw new Error(
                    "La fecha de nacimiento no puede ser futura"
                );
            }

            return true;
        }),
];


// REGLA PARA VALIDAR EL ID
export const idValidator = [
    param("id")
        .isMongoId()
        .withMessage(
            "El id proporcionado no es un ObjectId válido de MongoDB"
        ),
];