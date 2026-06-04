module.exports = (sequelize, DataTypes) => {
  const MovimientoInventario = sequelize.define(
    "MovimientoInventario",
    {
      id_movimiento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_insumo: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      tipo_movimiento: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      motivo: DataTypes.TEXT,
      fecha_movimiento: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      registrado_por: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      observaciones: DataTypes.TEXT,
    },
    {
      tableName: "movimientos_inventario",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  MovimientoInventario.associate = (models) => {
    MovimientoInventario.belongsTo(models.InsumoMedico, {
      foreignKey: "id_insumo",
      as: "insumo",
    });

    MovimientoInventario.belongsTo(models.Usuario, {
      foreignKey: "registrado_por",
      as: "usuarioRegistro",
    });
  };

  return MovimientoInventario;
};
