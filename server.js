import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import express from "express";
import cnxMongoDB from "./database/cnxMongoDB.js";

import usuarioRoutes from "./routes/usuario.routes.js";
import perfilNumerologicoRoutes from "./routes/perfilNumerologico.routes.js";
import lecturaRoutes from "./routes/lectura.routes.js";
import compatibilidadRoutes from "./routes/compatibilidad.routes.js";
import registroAuditoriaRoutes from "./routes/registroAuditoria.routes.js";
import authRoutes from "./routes/auth.routes.js";

cnxMongoDB();

const numerologia = express();

numerologia.use(express.json());

numerologia.use("/api/usuarios", usuarioRoutes);
numerologia.use("/api/perfiles-numerologicos", perfilNumerologicoRoutes);
numerologia.use("/api/lecturas", lecturaRoutes);
numerologia.use("/api/compatibilidades", compatibilidadRoutes);
numerologia.use("/api/registros-auditoria", registroAuditoriaRoutes);
numerologia.use("/api/auth", authRoutes);

// RUTAS/MÉTODOS NO MAPEADOS → 404 EN JSON (ataque #11)
numerologia.use((req, res) => {
    res.status(404).json({
        mensaje: `La ruta ${req.method} ${req.originalUrl} no existe en esta API`
    });
});



console.log(`Servidor funciona`);
numerologia.listen(process.env.PORT, () => {
    console.log(`Servidor: http://localhost:${process.env.PORT}`);
});