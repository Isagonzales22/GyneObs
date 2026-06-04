const { Tratamiento } = require("../../models");

const crearTratamiento = async (req, res) => {
  try {
    const tratamiento = await Tratamiento.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Tratamiento creado correctamente",
      tratamiento,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear tratamiento",
      error: error.message,
    });
  }
};

const obtenerTratamiento = async (req, res) => {
  try {
    const tratamiento = await Tratamiento.findByPk(req.params.id);

    if (!tratamiento) {
      return res.status(404).json({
        ok: false,
        message: "Tratamiento no encontrado",
      });
    }

    res.json({ ok: true, tratamiento });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener tratamiento",
      error: error.message,
    });
  }
};

const actualizarTratamiento = async (req, res) => {
  try {
    const tratamiento = await Tratamiento.findByPk(req.params.id);

    if (!tratamiento) {
      return res.status(404).json({
        ok: false,
        message: "Tratamiento no encontrado",
      });
    }

    await tratamiento.update(req.body);

    res.json({
      ok: true,
      message: "Tratamiento actualizado correctamente",
      tratamiento,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar tratamiento",
      error: error.message,
    });
  }
};

const eliminarTratamiento = async (req, res) => {
  try {
    const tratamiento = await Tratamiento.findByPk(req.params.id);

    if (!tratamiento) {
      return res.status(404).json({
        ok: false,
        message: "Tratamiento no encontrado",
      });
    }

    await tratamiento.destroy();

    res.json({
      ok: true,
      message: "Tratamiento eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar tratamiento",
      error: error.message,
    });
  }
};

module.exports = {
  crearTratamiento,
  obtenerTratamiento,
  actualizarTratamiento,
  eliminarTratamiento,
};