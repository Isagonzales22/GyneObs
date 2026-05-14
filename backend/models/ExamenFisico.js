module.exports = (sequelize, DataTypes) => {
  const ExamenFisico = sequelize.define(
    "ExamenFisico",
    {
      id_examen_fisico: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_consulta: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      talla: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: true,
      },

      peso: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: true,
      },

      imc: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: true,
      },

      presion_arterial: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },

      frecuencia_cardiaca: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      frecuencia_respiratoria: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      temperatura: {
        type: DataTypes.DECIMAL(4,2),
        allowNull: true,
      },

      saturacion_oxigeno: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: true,
      },

      observacion_general: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },

    {
      tableName: "examenes_fisicos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  ExamenFisico.associate = (models) => {
    ExamenFisico.belongsTo(models.ConsultaMedica, {
      foreignKey: "id_consulta",
      as: "consulta",
    });
  };

  return ExamenFisico;
};