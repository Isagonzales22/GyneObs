module.exports = (sequelize, DataTypes) => {
  const Diagnostico = sequelize.define(
    "Diagnostico",
    {
      id_diagnostico: {
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
      cie10: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      tipo_diagnostico: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "diagnosticos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Diagnostico.associate = (models) => {
    Diagnostico.belongsTo(models.ConsultaMedica, {
      foreignKey: "id_consulta",
      as: "consulta",
    });
  };

  return Diagnostico;
};