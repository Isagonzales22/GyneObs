module.exports = (sequelize, DataTypes) => {
  const ConsultaMedica = sequelize.define(
    "ConsultaMedica",
    {
      id_consulta: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_historia_clinica: {
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

      fecha_consulta: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      tipo_consulta: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },

      motivo_consulta: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      sintomas: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      diagnostico_general: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      tratamiento_general: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      indicaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      proxima_cita: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },

    {
      tableName: "consultas_medicas",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  ConsultaMedica.associate = (models) => {

    ConsultaMedica.belongsTo(models.HistoriaClinica, {
      foreignKey: "id_historia_clinica",
      as: "historiaClinica",
    });

    ConsultaMedica.belongsTo(models.Paciente, {
      foreignKey: "id_paciente",
      as: "paciente",
    });

    ConsultaMedica.belongsTo(models.Medico, {
      foreignKey: "id_medico",
      as: "medico",
    });
    ConsultaMedica.hasOne(models.ExamenFisico, {
  foreignKey: "id_consulta",
  as: "examenFisico",
});

ConsultaMedica.hasOne(models.ExamenGinecologico, {
  foreignKey: "id_consulta",
  as: "examenGinecologico",
});

ConsultaMedica.hasMany(models.Diagnostico, {
  foreignKey: "id_consulta",
  as: "diagnosticos",
});

ConsultaMedica.hasMany(models.Tratamiento, {
  foreignKey: "id_consulta",
  as: "tratamientos",
});

ConsultaMedica.hasOne(models.Receta, {
  foreignKey: "id_consulta",
  as: "receta",
});
  };

  return ConsultaMedica;
};
