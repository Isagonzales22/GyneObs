module.exports = (sequelize, DataTypes) => {
  const HistoriaClinica = sequelize.define(
    "HistoriaClinica",
    {
      id_historia_clinica: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_paciente: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      id_medico: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      fecha_apertura: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      fecha_primera_consulta: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      motivo_consulta: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      enfermedad_actual: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      observaciones_generales: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "historias_clinicas",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  HistoriaClinica.associate = (models) => {
    HistoriaClinica.belongsTo(models.Paciente, {
      foreignKey: "id_paciente",
      as: "paciente",
    });

    HistoriaClinica.belongsTo(models.Medico, {
      foreignKey: "id_medico",
      as: "medico",
    });
    HistoriaClinica.hasOne(models.AntecedenteGinecoObstetrico, {
  foreignKey: "id_historia_clinica",
  as: "antecedenteGO",
});

HistoriaClinica.hasMany(models.EmbarazoPrevio, {
  foreignKey: "id_historia_clinica",
  as: "embarazosPrevios",
});

HistoriaClinica.hasOne(models.AntecedentePatologico, {
  foreignKey: "id_historia_clinica",
  as: "antecedentePatologico",
});

HistoriaClinica.hasOne(models.AntecedenteNoPatologico, {
  foreignKey: "id_historia_clinica",
  as: "antecedenteNoPatologico",
});

HistoriaClinica.hasOne(models.AntecedenteFamiliar, {
  foreignKey: "id_historia_clinica",
  as: "antecedenteFamiliar",
});

HistoriaClinica.hasMany(models.ConsultaMedica, {
  foreignKey: "id_historia_clinica",
  as: "consultas",
});
  };

  return HistoriaClinica;
};