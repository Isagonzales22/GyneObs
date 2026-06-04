module.exports = (sequelize, DataTypes) => {
  const Receta = sequelize.define(
    "Receta",
    {
      id_receta: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_consulta: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      id_paciente: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      id_medico: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      fecha_receta: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },

      indicaciones_generales: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },

    {
      tableName: "recetas",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Receta.associate = (models) => {

    Receta.belongsTo(models.ConsultaMedica, {
      foreignKey: "id_consulta",
      as: "consulta",
    });

    Receta.belongsTo(models.Paciente, {
      foreignKey: "id_paciente",
      as: "paciente",
    });

    Receta.belongsTo(models.Medico, {
      foreignKey: "id_medico",
      as: "medico",
    });
    Receta.hasMany(models.DetalleReceta, {
        foreignKey: "id_receta",
        as: "detalleReceta",
});
  };

  return Receta;
};
