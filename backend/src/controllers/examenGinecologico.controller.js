const { ExamenGinecologico } = require("../../models");

const crearExamenGinecologico = async (req, res) => {
  try {
    const examen = await ExamenGinecologico.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Examen ginecológico creado correctamente",
      examen,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear examen ginecológico",
      error: error.message,
    });
  }
};

const obtenerExamenGinecologico = async (req, res) => {
  try {
    const examen = await ExamenGinecologico.findByPk(req.params.id);

    if (!examen) {
      return res.status(404).json({
        ok: false,
        message: "Examen ginecológico no encontrado",
      });
    }

    res.json({ ok: true, examen });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener examen ginecológico",
      error: error.message,
    });
  }
};

const actualizarExamenGinecologico = async (req, res) => {
  try {
    const examen = await ExamenGinecologico.findByPk(req.params.id);

    if (!examen) {
      return res.status(404).json({
        ok: false,
        message: "Examen ginecológico no encontrado",
      });
    }

    await examen.update(req.body);

    res.json({
      ok: true,
      message: "Examen ginecológico actualizado correctamente",
      examen,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar examen ginecológico",
      error: error.message,
    });
  }
};

const eliminarExamenGinecologico = async (req, res) => {
  try {
    const examen = await ExamenGinecologico.findByPk(req.params.id);

    if (!examen) {
      return res.status(404).json({
        ok: false,
        message: "Examen ginecológico no encontrado",
      });
    }

    await examen.destroy();

    res.json({
      ok: true,
      message: "Examen ginecológico eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar examen ginecológico",
      error: error.message,
    });
  }
};

module.exports = {
  crearExamenGinecologico,
  obtenerExamenGinecologico,
  actualizarExamenGinecologico,
  eliminarExamenGinecologico,
};