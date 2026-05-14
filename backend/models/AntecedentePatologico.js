module.exports = (sequelize, DataTypes) => {
  const AntecedentePatologico = sequelize.define(
    "AntecedentePatologico",
    {
      id_antecedente_patologico: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_historia_clinica: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      enfermedades_base: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      alergias: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      cirugias_previas: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      hospitalizaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      medicamentos_actuales: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      antecedentes_infecciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      antecedentes_ets: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },

    {
      tableName: "antecedentes_patologicos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  AntecedentePatologico.associate = (models) => {
    AntecedentePatologico.belongsTo(models.HistoriaClinica, {
      foreignKey: "id_historia_clinica",
      as: "historiaClinica",
    });
  };

  return AntecedentePatologico;
};