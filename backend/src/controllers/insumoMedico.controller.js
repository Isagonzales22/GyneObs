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

    const userRole = req.usuario?.rol?.nombre_rol;

    if (userRole === "MEDICO" || userRole === "MEDICO_RESIDENTE" || userRole === "SECRETARIA") {
      const allowedFields = ["stock_actual"];
      const invalidFields = Object.keys(req.body).filter(
        (field) => !allowedFields.includes(field)
      );

      if (invalidFields.length > 0) {
        return res.status(403).json({
          ok: false,
          message: "Solo puedes actualizar el stock al retirar insumo.",
        });
      }

      if (typeof req.body.stock_actual === "undefined") {
        return res.status(400).json({
          ok: false,
          message: "La actualización de stock es obligatoria para médicos.",
        });
      }
    }

    if (typeof req.body.stock_actual !== "undefined" && req.body.stock_actual < 0) {
      return res.status(400).json({
        ok: false,
        message: "El stock no puede ser negativo.",
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