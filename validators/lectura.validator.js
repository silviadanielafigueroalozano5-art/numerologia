import { body, param } from "express-validator";
import Usuario from "../models/Usuario.model.js";

// Reglas para CREAR una lectura
export const crearLecturaValidator = [

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

    body("prompt")
        .trim()
        .notEmpty()
        .withMessage("El prompt es obligatorio"),

    body("respuesta")
        .trim()
        .notEmpty()
        .withMessage("La respuesta es obligatoria"),

    body("tipoLectura")
        .notEmpty()
        .withMessage("El tipo de lectura es obligatorio")
        .isIn(["diaria", "general", "anual"])
        .withMessage("El tipo de lectura no es válido"),
];


// Reglas para ACTUALIZAR una lectura
// Los campos son opcionales, pero si vienen deben ser válidos
export const actualizarLecturaValidator = [

    body("usuario_id")
        .optional()
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

    body("prompt")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("El prompt no puede estar vacío"),

    body("respuesta")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("La respuesta no puede estar vacía"),

    body("tipoLectura")
        .optional()
        .isIn(["diaria", "general", "anual"])
        .withMessage("El tipo de lectura no es válido"),
];


// Regla para validar el :id
export const idValidator = [
    param("id")
        .isMongoId()
        .withMessage(
            "El id proporcionado no es un ObjectId válido de MongoDB"
        ),
];