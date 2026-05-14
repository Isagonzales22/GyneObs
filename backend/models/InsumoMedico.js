module.exports = (sequelize, DataTypes) => {
  const InsumoMedico = sequelize.define(
    "InsumoMedico",
    {
      id_insumo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_categoria_insumo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      unidad_medida: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      stock_actual: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      stock_minimo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },

    {
      tableName: "insumos_medicos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  InsumoMedico.associate = (models) => {

    InsumoMedico.belongsTo(models.CategoriaInsumo, {
      foreignKey: "id_categoria_insumo",
      as: "categoria",
    });

    InsumoMedico.hasMany(models.MovimientoInventario, {
        foreignKey: "id_insumo",
        as: "movimientos",
});
  };

  return InsumoMedico;
};
