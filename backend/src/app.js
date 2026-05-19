const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const pacienteRoutes = require("./routes/paciente.routes");
const historiaClinicaRoutes = require("./routes/historiaClinica.routes");
const antecedenteGORoutes = require("./routes/antecedenteGO.routes");
const embarazoPrevioRoutes = require("./routes/embarazoPrevio.routes");
const antecedentePatologicoRoutes = require("./routes/antecedentePatologico.routes");
const antecedenteNoPatologicoRoutes = require("./routes/antecedenteNoPatologico.routes");
const antecedenteFamiliarRoutes = require("./routes/antecedenteFamiliar.routes");
const consultaMedicaRoutes = require("./routes/consultaMedica.routes");
const examenFisicoRoutes = require("./routes/examenFisico.routes");
const examenGinecologicoRoutes = require("./routes/examenGinecologico.routes");
const diagnosticoRoutes = require("./routes/diagnostico.routes");
const tratamientoRoutes = require("./routes/tratamiento.routes");
const recetaRoutes = require("./routes/receta.routes");
const detalleRecetaRoutes = require("./routes/detalleReceta.routes");
const citaRoutes = require("./routes/cita.routes");
const cirugiaRoutes = require("./routes/cirugia.routes");
const insumoMedicoRoutes = require("./routes/insumoMedico.routes");
const movimientoInventarioRoutes = require("./routes/movimientoInventario.routes");
const contenidoEducativoRoutes = require("./routes/contenidoEducativo.routes");
const medicoRoutes = require("./routes/medico.routes");
const passport = require("./config/passport");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/historias-clinicas", historiaClinicaRoutes);
app.use("/api/antecedentes-go", antecedenteGORoutes);
app.use("/api/embarazos-previos", embarazoPrevioRoutes);
app.use("/api/antecedentes-patologicos", antecedentePatologicoRoutes);
app.use("/api/antecedentes-no-patologicos", antecedenteNoPatologicoRoutes);
app.use("/api/antecedentes-familiares", antecedenteFamiliarRoutes);
app.use("/api/consultas-medicas", consultaMedicaRoutes);
app.use("/api/examenes-fisicos", examenFisicoRoutes);
app.use("/api/examenes-ginecologicos", examenGinecologicoRoutes);
app.use("/api/diagnosticos", diagnosticoRoutes);
app.use("/api/tratamientos", tratamientoRoutes);
app.use("/api/recetas", recetaRoutes);
app.use("/api/detalle-recetas", detalleRecetaRoutes);
app.use("/api/citas", citaRoutes);
app.use("/api/cirugias", cirugiaRoutes);
app.use("/api/insumos", insumoMedicoRoutes);
app.use("/api/movimientos-inventario", movimientoInventarioRoutes);
app.use("/api/contenidos-educativos", contenidoEducativoRoutes);
app.use("/api/medicos", medicoRoutes);
app.use('/api/uploads', express.static('uploads'));
app.use('/api/upload', require('./routes/upload.routes')); 


app.use(express.json({ limit: '10mb' }));      // Aumentar límite a 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API del sistema de ginecología funcionando correctamente",
  });
});

module.exports = app;