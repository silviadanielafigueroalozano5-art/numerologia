import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    nombreCompleto: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    passwordHash: {
        type: String,
        required: true
    },

    fechaNacimiento: {
        type: Date,
        required: true
    },

    fechaRegistro: {
        type: Date,
        default: Date.now
    },

    rol: {
        type: String,
        enum: ["cliente", "admin"],
        default: "cliente"
    }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;