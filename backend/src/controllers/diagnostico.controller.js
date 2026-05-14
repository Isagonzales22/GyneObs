const { Diagnostico } = require("../../models");

const crearDiagnostico = async (req, res) => {
  try {
    const diagnostico = await Diagnostico.create(req.body);
    res.status(201).json({
      ok: true,
      message: "Diagnóstico creado correctamente",
      diagnostico,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear diagnóstico",
      error: error.message,
    });
  }
};

const obtenerDiagnostico = async (req, res) => {
  try {
    const diagnostico = await Diagnostico.findByPk(req.params.id);

    if (!diagnostico) {
      return res.status(404).json({
        ok: false,
        message: "Diagnóstico no encontrado",
      });
    }

    res.json({ ok: true, diagnostico });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener diagnóstico",
      error: error.message,
    });
  }
};

const actualizarDiagnostico = async (req, res) => {
  try {
    const diagnostico = await Diagnostico.findByPk(req.params.id);

    if (!diagnostico) {
      return res.status(404).json({
        ok: false,
        message: "Diagnóstico no encontrado",
      });
    }

    await diagnostico.update(req.body);

    res.json({
      ok: true,
      message: "Diagnóstico actualizado correctamente",
      diagnostico,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar diagnóstico",
      error: error.message,
    });
  }
};

const eliminarDiagnostico = async (req, res) => {
  try {
    const diagnostico = await Diagnostico.findByPk(req.params.id);

    if (!diagnostico) {
      return res.status(404).json({
        ok: false,
        message: "Diagnóstico no encontrado",
      });
    }

    await diagnostico.destroy();

    res.json({
      ok: true,
      message: "Diagnóstico eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar diagnóstico",
      error: error.message,
    });
  }
};

module.exports = {
  crearDiagnostico,
  obtenerDiagnostico,
  actualizarDiagnostico,
  eliminarDiagnostico,
};