module.exports = (sequelize, DataTypes) => {
  const DetalleReceta = sequelize.define(
    "DetalleReceta",
    {
      id_detalle_receta: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_receta: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      medicamento: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      dosis: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      frecuencia: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      duracion: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      via_administracion: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },

    {
      tableName: "detalle_receta",
      timestamps: false,
    }
  );

  DetalleReceta.associate = (models) => {
    DetalleReceta.belongsTo(models.Receta, {
      foreignKey: "id_receta",
      as: "receta",
    });
  };

  return DetalleReceta;
};