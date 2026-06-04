const { EmbarazoPrevio } = require("../../models");

const crearEmbarazoPrevio = async (req, res) => {
  try {
    const embarazo = await EmbarazoPrevio.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Embarazo previo creado correctamente",
      embarazo,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear embarazo previo",
      error: error.message,
    });
  }
};

const obtenerEmbarazoPrevio = async (req, res) => {
  try {
    const { id } = req.params;

    const embarazo = await EmbarazoPrevio.findByPk(id);

    if (!embarazo) {
      return res.status(404).json({
        ok: false,
        message: "Embarazo previo no encontrado",
      });
    }

    res.json({ ok: true, embarazo });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener embarazo previo",
      error: error.message,
    });
  }
};

const actualizarEmbarazoPrevio = async (req, res) => {
  try {
    const { id } = req.params;

    const embarazo = await EmbarazoPrevio.findByPk(id);

    if (!embarazo) {
      return res.status(404).json({
        ok: false,
        message: "Embarazo previo no encontrado",
      });
    }

    await embarazo.update(req.body);

    res.json({
      ok: true,
      message: "Embarazo previo actualizado correctamente",
      embarazo,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar embarazo previo",
      error: error.message,
    });
  }
};

const eliminarEmbarazoPrevio = async (req, res) => {
  try {
    const { id } = req.params;

    const embarazo = await EmbarazoPrevio.findByPk(id);

    if (!embarazo) {
      return res.status(404).json({
        ok: false,
        message: "Embarazo previo no encontrado",
      });
    }

    await embarazo.destroy();

    res.json({
      ok: true,
      message: "Embarazo previo eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar embarazo previo",
      error: error.message,
    });
  }
};

module.exports = {
  crearEmbarazoPrevio,
  obtenerEmbarazoPrevio,
  actualizarEmbarazoPrevio,
  eliminarEmbarazoPrevio,
};