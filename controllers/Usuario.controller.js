import Usuario from "../models/Usuario.model.js";
import Lectura from "../models/Lectura.model.js";
import PerfilNumerologico from "../models/PerfilNumerologico.model.js";
import bcrypt from "bcrypt";

// CREAR USUARIO
export const crearUsuario = async (req, res) => {
    try {
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

        res.status(201).json(usuario);

    } catch (error) {
        res.status(400).json({
            mensaje: "Error al crear usuario",
            error: error.message
        });
    }
};


// LISTAR USUARIOS
export const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find();

        res.status(200).json(usuarios);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al listar usuarios",
            error: error.message
        });
    }
};


// OBTENER USUARIO POR ID
export const obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.status(200).json(usuario);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener usuario",
            error: error.message
        });
    }
};


// ACTUALIZAR USUARIO
export const actualizarUsuario = async (req, res) => {
    try {
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

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.status(200).json(usuario);

    } catch (error) {
        res.status(400).json({
            mensaje: "Error al actualizar usuario",
            error: error.message
        });
    }
};


// ELIMINAR USUARIO (con borrado en cascada de sus documentos hijos - ataque #13)
export const eliminarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        // Se eliminan los documentos que referencian a este usuario
        // para no dejar huérfanos (usuario_id resolviendo null en populate)
        await Lectura.deleteMany({ usuario_id: req.params.id });
        await PerfilNumerologico.deleteMany({ usuario_id: req.params.id });

        res.status(200).json({
            mensaje: "Usuario eliminado correctamente junto con sus lecturas y perfiles asociados"
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar usuario",
            error: error.message
        });
    }
};