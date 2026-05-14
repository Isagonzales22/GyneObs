const { MovimientoInventario, InsumoMedico, Usuario } = require("../../models");

const crearMovimiento = async (req, res) => {
  try {
    const { id_insumo, tipo_movimiento, cantidad } = req.body;

    const insumo = await InsumoMedico.findByPk(id_insumo);

    if (!insumo) {
      return res.status(404).json({
        ok: false,
        message: "Insumo no encontrado",
      });
    }

    if (tipo_movimiento === "SALIDA" && insumo.stock_actual < cantidad) {
      return res.status(400).json({
        ok: false,
        message: "Stock insuficiente para realizar la salida",
      });
    }

    const movimiento = await MovimientoInventario.create(req.body);

    if (tipo_movimiento === "ENTRADA") {
      await insumo.update({
        stock_actual: insumo.stock_actual + cantidad,
      });
    }

    if (tipo_movimiento === "SALIDA") {
      await insumo.update({
        stock_actual: insumo.stock_actual - cantidad,
      });
    }

    res.status(201).json({
      ok: true,
      message: "Movimiento de inventario creado correctamente",
      movimiento,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear movimiento de inventario",
      error: error.message,
    });
  }
};

const listarMovimientos = async (req, res) => {
  try {
    const movimientos = await MovimientoInventario.findAll({
      include: [
        { model: InsumoMedico, as: "insumo" },
        { model: Usuario, as: "usuarioRegistro" },
      ],
      order: [["fecha_movimiento", "DESC"]],
    });

    res.json({ ok: true, movimientos });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar movimientos",
      error: error.message,
    });
  }
};

const obtenerMovimiento = async (req, res) => {
  try {
    const movimiento = await MovimientoInventario.findByPk(req.params.id, {
      include: [
        { model: InsumoMedico, as: "insumo" },
        { model: Usuario, as: "usuarioRegistro" },
      ],
    });

    if (!movimiento) {
      return res.status(404).json({
        ok: false,
        message: "Movimiento no encontrado",
      });
    }

    res.json({ ok: true, movimiento });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener movimiento",
      error: error.message,
    });
  }
};

module.exports = {
  crearMovimiento,
  listarMovimientos,
  obtenerMovimiento,
};