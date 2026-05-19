const { Paciente, Usuario } = require("../../models");

const listarPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.findAll({
      include: [{ model: Usuario, as: "usuario" }],
      order: [["created_at", "DESC"]],
    });

    res.json({ ok: true, pacientes });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar pacientes",
      error: error.message,
    });
  }
};

const crearPaciente = async (req, res) => {
  try {
    // Autogenerar codigo_paciente si no se proporciona
    if (!req.body.codigo_paciente) {
      const count = await Paciente.count();
      const codeNum = String(count + 1).padStart(4, '0');
      req.body.codigo_paciente = `PAC-${codeNum}`;
    }
    const paciente = await Paciente.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Paciente creado correctamente",
      paciente,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear paciente",
      error: error.message,
    });
  }
};

const obtenerPacientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id, {
      include: [{ model: Usuario, as: "usuario" }],
    });

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    res.json({ ok: true, paciente });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener paciente",
      error: error.message,
    });
  }
};

const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id);

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    await paciente.update(req.body);

    res.json({
      ok: true,
      message: "Paciente actualizado correctamente",
      paciente,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar paciente",
      error: error.message,
    });
  }
};

const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id);

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    await paciente.destroy();

    res.json({
      ok: true,
      message: "Paciente eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar paciente",
      error: error.message,
    });
  }
};

module.exports = {
  listarPacientes,
  crearPaciente,
  obtenerPacientePorId,
  actualizarPaciente,
  eliminarPaciente,
};