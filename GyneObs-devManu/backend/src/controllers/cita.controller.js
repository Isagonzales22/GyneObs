const { Cita, Paciente, Medico, TipoConsulta, Usuario } = require("../../models");
const { esPaciente } = require("../utils/roles");

const crearCita = async (req, res) => {
  try {
    const cita = await Cita.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Cita médica creada correctamente",
      cita,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear cita médica",
      error: error.message,
    });
  }
};

const listarCitas = async (req, res) => {
  try {
    let whereClause = {};
    if (esPaciente(req.usuario)) {
      let paciente = await Paciente.findOne({ where: { id_usuario: req.usuario.id_usuario } });
      if (!paciente) {
        const count = await Paciente.count();
        const codeNum = String(count + 1).padStart(4, "0");
        paciente = await Paciente.create({
          id_usuario: req.usuario.id_usuario,
          codigo_paciente: `PAC-${codeNum}`,
          ocupacion: "Ninguna",
          estado_civil: "Soltera",
          seguro_medico: "SUS",
          tipo_sangre: "O+",
          observaciones: "Registro automático al consultar citas",
        });
      }
      whereClause.id_paciente = paciente.id_paciente;
    }

    const citas = await Cita.findAll({
      where: whereClause,
      include: [
        { 
          model: Paciente, 
          as: "paciente",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { 
          model: Medico, 
          as: "medico",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { model: TipoConsulta, as: "tipoConsulta" },
        { model: Usuario, as: "usuarioCreador" },
      ],
      order: [["fecha_cita", "DESC"]],
    });

    res.json({ ok: true, citas });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar citas médicas",
      error: error.message,
    });
  }
};

const obtenerCita = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id, {
      include: [
        { 
          model: Paciente, 
          as: "paciente",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { 
          model: Medico, 
          as: "medico",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { model: TipoConsulta, as: "tipoConsulta" },
        { model: Usuario, as: "usuarioCreador" },
      ],
    });

    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita médica no encontrada",
      });
    }

    if (esPaciente(req.usuario)) {
      const paciente = await Paciente.findOne({ where: { id_usuario: req.usuario.id_usuario } });
      if (!paciente || cita.id_paciente !== paciente.id_paciente) {
        return res.status(403).json({
          ok: false,
          message: "No tienes permisos para ver esta cita"
        });
      }
    }

    res.json({ ok: true, cita });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener cita médica",
      error: error.message,
    });
  }
};

const actualizarCita = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id);

    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita médica no encontrada",
      });
    }

    await cita.update(req.body);

    const citaActualizada = await Cita.findByPk(req.params.id, {
      include: [
        { 
          model: Paciente, 
          as: "paciente",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { 
          model: Medico, 
          as: "medico",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { model: TipoConsulta, as: "tipoConsulta" },
        { model: Usuario, as: "usuarioCreador" },
      ],
    });

    res.json({
      ok: true,
      message: "Cita médica actualizada correctamente",
      cita: citaActualizada,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar cita médica",
      error: error.message,
    });
  }
};

const cancelarCita = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id);

    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita médica no encontrada",
      });
    }

    await cita.update({
      estado_cita: "CANCELADA",
      observaciones: req.body.observaciones || cita.observaciones,
    });

    res.json({
      ok: true,
      message: "Cita médica cancelada correctamente",
      cita,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al cancelar cita médica",
      error: error.message,
    });
  }
};

const eliminarCita = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id);

    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita médica no encontrada",
      });
    }

    await cita.destroy();

    res.json({
      ok: true,
      message: "Cita médica eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar cita médica",
      error: error.message,
    });
  }
};

module.exports = {
  crearCita,
  listarCitas,
  obtenerCita,
  actualizarCita,
  cancelarCita,
  eliminarCita,
};