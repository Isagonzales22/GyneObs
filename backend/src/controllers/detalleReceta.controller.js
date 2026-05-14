const { DetalleReceta } = require("../../models");

const crearDetalleReceta = async (req, res) => {
  try {
    const detalle = await DetalleReceta.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Detalle de receta creado correctamente",
      detalle,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear detalle de receta",
      error: error.message,
    });
  }
};

const obtenerDetalleReceta = async (req, res) => {
  try {
    const detalle = await DetalleReceta.findByPk(req.params.id);

    if (!detalle) {
      return res.status(404).json({
        ok: false,
        message: "Detalle de receta no encontrado",
      });
    }

    res.json({ ok: true, detalle });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener detalle de receta",
      error: error.message,
    });
  }
};

const actualizarDetalleReceta = async (req, res) => {
  try {
    const detalle = await DetalleReceta.findByPk(req.params.id);

    if (!detalle) {
      return res.status(404).json({
        ok: false,
        message: "Detalle de receta no encontrado",
      });
    }

    await detalle.update(req.body);

    res.json({
      ok: true,
      message: "Detalle de receta actualizado correctamente",
      detalle,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar detalle de receta",
      error: error.message,
    });
  }
};

const eliminarDetalleReceta = async (req, res) => {
  try {
    const detalle = await DetalleReceta.findByPk(req.params.id);

    if (!detalle) {
      return res.status(404).json({
        ok: false,
        message: "Detalle de receta no encontrado",
      });
    }

    await detalle.destroy();

    res.json({
      ok: true,
      message: "Detalle de receta eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar detalle de receta",
      error: error.message,
    });
  }
};

module.exports = {
  crearDetalleReceta,
  obtenerDetalleReceta,
  actualizarDetalleReceta,
  eliminarDetalleReceta,
};