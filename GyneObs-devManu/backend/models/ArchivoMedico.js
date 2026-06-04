module.exports = (sequelize, DataTypes) => {
  const ArchivoMedico = sequelize.define(
    "ArchivoMedico",
    {
      id_archivo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_paciente: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      id_historia_clinica: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      nombre_archivo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tipo_archivo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      url_archivo: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      subido_por: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "archivos_medicos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  ArchivoMedico.associate = (models) => {
    ArchivoMedico.belongsTo(models.Paciente, {
      foreignKey: "id_paciente",
      as: "paciente",
    });

    ArchivoMedico.belongsTo(models.HistoriaClinica, {
      foreignKey: "id_historia_clinica",
      as: "historiaClinica",
    });

    ArchivoMedico.belongsTo(models.Usuario, {
      foreignKey: "subido_por",
      as: "usuarioSubida",
    });
  };

  return ArchivoMedico;
};