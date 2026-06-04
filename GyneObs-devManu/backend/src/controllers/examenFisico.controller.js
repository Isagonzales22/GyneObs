const { ExamenFisico } = require("../../models");

const crearExamenFisico = async (req, res) => {
  try {
    const examen = await ExamenFisico.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Examen físico creado correctamente",
      examen,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear examen físico",
      error: error.message,
    });
  }
};

const obtenerExamenFisico = async (req, res) => {
  try {
    const examen = await ExamenFisico.findByPk(req.params.id);

    if (!examen) {
      return res.status(404).json({
        ok: false,
        message: "Examen físico no encontrado",
      });
    }

    res.json({ ok: true, examen });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener examen físico",
      error: error.message,
    });
  }
};

const actualizarExamenFisico = async (req, res) => {
  try {
    const examen = await ExamenFisico.findByPk(req.params.id);

    if (!examen) {
      return res.status(404).json({
        ok: false,
        message: "Examen físico no encontrado",
      });
    }

    await examen.update(req.body);

    res.json({
      ok: true,
      message: "Examen físico actualizado correctamente",
      examen,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar examen físico",
      error: error.message,
    });
  }
};

const eliminarExamenFisico = async (req, res) => {
  try {
    const examen = await ExamenFisico.findByPk(req.params.id);

    if (!examen) {
      return res.status(404).json({
        ok: false,
        message: "Examen físico no encontrado",
      });
    }

    await examen.destroy();

    res.json({
      ok: true,
      message: "Examen físico eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar examen físico",
      error: error.message,
    });
  }
};

module.exports = {
  crearExamenFisico,
  obtenerExamenFisico,
  actualizarExamenFisico,
  eliminarExamenFisico,
};