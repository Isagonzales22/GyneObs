const { Cita, Paciente, Medico, TipoConsulta, Usuario } = require("../../models");

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
    const citas = await Cita.findAll({
      include: [
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
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
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
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

    res.json({
      ok: true,
      message: "Cita médica actualizada correctamente",
      cita,
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