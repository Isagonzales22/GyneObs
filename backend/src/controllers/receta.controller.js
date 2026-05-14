const { Receta } = require("../../models");

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
    const receta = await Receta.findByPk(req.params.id);

    if (!receta) {
      return res.status(404).json({
        ok: false,
        message: "Receta no encontrada",
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

const actualizarReceta = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id);

    if (!receta) {
      return res.status(404).json({
        ok: false,
        message: "Receta no encontrada",
      });
    }

    await receta.update(req.body);

    res.json({
      ok: true,
      message: "Receta actualizada correctamente",
      receta,
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
  crearReceta,
  obtenerReceta,
  actualizarReceta,
  eliminarReceta,
};