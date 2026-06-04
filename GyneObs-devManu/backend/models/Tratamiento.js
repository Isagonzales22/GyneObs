module.exports = (sequelize, DataTypes) => {
  const Tratamiento = sequelize.define(
    "Tratamiento",
    {
      id_tratamiento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_consulta: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      indicaciones_generales: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },

    {
      tableName: "tratamientos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Tratamiento.associate = (models) => {
    Tratamiento.belongsTo(models.ConsultaMedica, {
      foreignKey: "id_consulta",
      as: "consulta",
    });
  };

  return Tratamiento;
};