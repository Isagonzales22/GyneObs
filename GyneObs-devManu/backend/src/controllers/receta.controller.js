const {
  Receta,
  DetalleReceta,
  Paciente,
  Medico,
  Usuario,
  ConsultaMedica,
  HistoriaClinica,
} = require("../../models");
const { esPaciente, normalizarRol } = require("../utils/roles");

const obtenerMedicoDelUsuario = async (usuario) => {
  let medico = await Medico.findOne({ where: { id_usuario: usuario.id_usuario } });
  if (!medico) {
    medico = await Medico.create({
      id_usuario: usuario.id_usuario,
      especialidad: "Obstetricia y Ginecología",
      estado: true,
    });
  }
  return medico;
};

const includeRecetaCompleto = [
  { model: DetalleReceta, as: "detalleReceta" },
  {
    model: Paciente,
    as: "paciente",
    include: [{ model: Usuario, as: "usuario" }],
  },
  {
    model: Medico,
    as: "medico",
    include: [{ model: Usuario, as: "usuario" }],
  },
  { model: ConsultaMedica, as: "consulta" },
];

const asegurarPacienteUsuario = async (usuario) => {
  let paciente = await Paciente.findOne({ where: { id_usuario: usuario.id_usuario } });
  if (!paciente) {
    const count = await Paciente.count();
    const codeNum = String(count + 1).padStart(4, "0");
    paciente = await Paciente.create({
      id_usuario: usuario.id_usuario,
      codigo_paciente: `PAC-${codeNum}`,
      ocupacion: "Ninguna",
      estado_civil: "Soltera",
      seguro_medico: "SUS",
      tipo_sangre: "O+",
      observaciones: "Registro automático",
    });
  }
  return paciente;
};

const verificarAccesoReceta = async (req, receta) => {
  if (!esPaciente(req.usuario)) return true;
  const paciente = await asegurarPacienteUsuario(req.usuario);
  return receta.id_paciente === paciente.id_paciente;
};

const listarRecetas = async (req, res) => {
  try {
    const where = {};
    if (esPaciente(req.usuario)) {
      const paciente = await asegurarPacienteUsuario(req.usuario);
      where.id_paciente = paciente.id_paciente;
    } else if (normalizarRol(req.usuario?.rol?.nombre_rol) === "MEDICO") {
      const medico = await obtenerMedicoDelUsuario(req.usuario);
      where.id_medico = medico.id_medico;
    }

    const recetas = await Receta.findAll({
      where,
      include: includeRecetaCompleto,
      order: [
        ["fecha_receta", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    res.json({ ok: true, recetas });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar recetas",
      error: error.message,
    });
  }
};

const crearRecetaCompleta = async (req, res) => {
  try {
    let {
      id_paciente,
      id_medico,
      indicaciones_generales,
      medicamentos = [],
      fecha_receta,
    } = req.body;

    if (normalizarRol(req.usuario?.rol?.nombre_rol) === "MEDICO") {
      const medicoLogueado = await obtenerMedicoDelUsuario(req.usuario);
      id_medico = medicoLogueado.id_medico;
    }

    if (!id_paciente || !id_medico) {
      return res.status(400).json({
        ok: false,
        message: "Paciente y médico son obligatorios",
      });
    }

    const medsValidos = (medicamentos || []).filter(
      (m) => m.medicamento && String(m.medicamento).trim()
    );
    if (medsValidos.length === 0 && !indicaciones_generales) {
      return res.status(400).json({
        ok: false,
        message: "Agrega al menos un medicamento o indicaciones generales",
      });
    }

    let historia = await HistoriaClinica.findOne({ where: { id_paciente } });
    if (!historia) {
      historia = await HistoriaClinica.create({
        id_paciente,
        id_medico,
        motivo_consulta: "Historia clínica generada al emitir receta",
      });
    }

    const consulta = await ConsultaMedica.create({
      id_historia_clinica: historia.id_historia_clinica,
      id_paciente,
      id_medico,
      fecha_consulta: new Date(),
      tipo_consulta: "Receta médica",
      motivo_consulta: "Emisión de receta",
      diagnostico_general: indicaciones_generales || null,
    });

    const receta = await Receta.create({
      id_consulta: consulta.id_consulta,
      id_paciente,
      id_medico,
      indicaciones_generales: indicaciones_generales || null,
      fecha_receta: fecha_receta || new Date().toISOString().slice(0, 10),
    });

    for (const med of medsValidos) {
      await DetalleReceta.create({
        id_receta: receta.id_receta,
        medicamento: med.medicamento.trim(),
        dosis: med.dosis || null,
        frecuencia: med.frecuencia || null,
        duracion: med.duracion || null,
        via_administracion: med.via_administracion || null,
        observaciones: med.observaciones || null,
      });
    }

    const recetaCompleta = await Receta.findByPk(receta.id_receta, {
      include: includeRecetaCompleto,
    });

    res.status(201).json({
      ok: true,
      message: "Receta emitida correctamente",
      receta: recetaCompleta,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear receta",
      error: error.message,
    });
  }
};

const crearReceta = async (req, res) => {
  try {
    const receta = await Receta.create(req.body);
    res.status(201).json({
      ok: true,
      message: "Receta creada correctamente",
      receta,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear receta",
      error: error.message,
    });
  }
};

const obtenerReceta = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id, {
      include: includeRecetaCompleto,
    });

    if (!receta) {
      return res.status(404).json({
        ok: false,
        message: "Receta no encontrada",
      });
    }

    if (!(await verificarAccesoReceta(req, receta))) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para ver esta receta",
      });
    }

    res.json({ ok: true, receta });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener receta",
      error: error.message,
    });
  }
};

const obtenerRecetaPorConsulta = async (req, res) => {
  try {
    const { consultaId } = req.params;
    const receta = await Receta.findOne({
      where: { id_consulta: consultaId },
      include: includeRecetaCompleto,
    });

    if (!receta) {
      return res.status(404).json({
        ok: false,
        message: "Receta no encontrada para esta consulta",
      });
    }

    if (!(await verificarAccesoReceta(req, receta))) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para ver esta receta",
      });
    }

    res.json({ ok: true, receta });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener receta por consulta",
      error: error.message,
    });
  }
};

const actualizarReceta = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id);

    if (!receta) {
      return res.status(404).json({
        ok: false,
        message: "Receta no encontrada",
      });
    }

    const { indicaciones_generales, fecha_receta, medicamentos } = req.body;
    const updateReceta = {
      indicaciones_generales:
        indicaciones_generales !== undefined
          ? indicaciones_generales
          : receta.indicaciones_generales,
      fecha_receta: fecha_receta || receta.fecha_receta,
    };

    if (normalizarRol(req.usuario?.rol?.nombre_rol) === "MEDICO") {
      const medicoLogueado = await obtenerMedicoDelUsuario(req.usuario);
      if (receta.id_medico !== medicoLogueado.id_medico) {
        return res.status(403).json({
          ok: false,
          message: "Solo puedes editar recetas que hayas emitido",
        });
      }
      updateReceta.id_medico = medicoLogueado.id_medico;
    }

    await receta.update(updateReceta);

    if (Array.isArray(medicamentos)) {
      await DetalleReceta.destroy({ where: { id_receta: receta.id_receta } });
      const medsValidos = medicamentos.filter(
        (m) => m.medicamento && String(m.medicamento).trim()
      );
      for (const med of medsValidos) {
        await DetalleReceta.create({
          id_receta: receta.id_receta,
          medicamento: med.medicamento.trim(),
          dosis: med.dosis || null,
          frecuencia: med.frecuencia || null,
          duracion: med.duracion || null,
          via_administracion: med.via_administracion || null,
          observaciones: med.observaciones || null,
        });
      }
    }

    const recetaActualizada = await Receta.findByPk(receta.id_receta, {
      include: includeRecetaCompleto,
    });

    res.json({
      ok: true,
      message: "Receta actualizada correctamente",
      receta: recetaActualizada,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar receta",
      error: error.message,
    });
  }
};

const eliminarReceta = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id);

    if (!receta) {
      return res.status(404).json({
        ok: false,
        message: "Receta no encontrada",
      });
    }

    if (normalizarRol(req.usuario?.rol?.nombre_rol) === "MEDICO") {
      const medicoLogueado = await obtenerMedicoDelUsuario(req.usuario);
      if (receta.id_medico !== medicoLogueado.id_medico) {
        return res.status(403).json({
          ok: false,
          message: "Solo puedes eliminar recetas que hayas emitido",
        });
      }
    }

    await DetalleReceta.destroy({ where: { id_receta: receta.id_receta } });
    await receta.destroy();

    res.json({
      ok: true,
      message: "Receta eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar receta",
      error: error.message,
    });
  }
};

module.exports = {
  listarRecetas,
  crearRecetaCompleta,
  crearReceta,
  obtenerReceta,
  obtenerRecetaPorConsulta,
  actualizarReceta,
  eliminarReceta,
};
