const { InsumoMedico, CategoriaInsumo } = require("../../models");

const crearInsumo = async (req, res) => {
  try {
    const insumo = await InsumoMedico.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Insumo médico creado correctamente",
      insumo,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear insumo médico",
      error: error.message,
    });
  }
};

const listarInsumos = async (req, res) => {
  try {
    const insumos = await InsumoMedico.findAll({
      include: [{ model: CategoriaInsumo, as: "categoria" }],
      order: [["created_at", "DESC"]],
    });

    res.json({ ok: true, insumos });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar insumos médicos",
      error: error.message,
    });
  }
};

const obtenerInsumo = async (req, res) => {
  try {
    const insumo = await InsumoMedico.findByPk(req.params.id, {
      include: [{ model: CategoriaInsumo, as: "categoria" }],
    });

    if (!insumo) {
      return res.status(404).json({
        ok: false,
        message: "Insumo médico no encontrado",
      });
    }

    res.json({ ok: true, insumo });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener insumo médico",
      error: error.message,
    });
  }
};

const actualizarInsumo = async (req, res) => {
  try {
    const insumo = await InsumoMedico.findByPk(req.params.id);

    if (!insumo) {
      return res.status(404).json({
        ok: false,
        message: "Insumo médico no encontrado",
      });
    }

    await insumo.update(req.body);

    res.json({
      ok: true,
      message: "Insumo médico actualizado correctamente",
      insumo,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar insumo médico",
      error: error.message,
    });
  }
};

const eliminarInsumo = async (req, res) => {
  try {
    const insumo = await InsumoMedico.findByPk(req.params.id);

    if (!insumo) {
      return res.status(404).json({
        ok: false,
        message: "Insumo médico no encontrado",
      });
    }

    await insumo.update({ estado: false });

    res.json({
      ok: true,
      message: "Insumo médico desactivado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar insumo médico",
      error: error.message,
    });
  }
};

module.exports = {
  crearInsumo,
  listarInsumos,
  obtenerInsumo,
  actualizarInsumo,
  eliminarInsumo,
};