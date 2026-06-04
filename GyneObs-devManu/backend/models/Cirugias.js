module.exports = (sequelize, DataTypes) => {
  const Cirugia = sequelize.define(
    "Cirugia",
    {
      id_cirugia: {
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
        allowNull: false,
      },

      id_tipo_cirugia: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      fecha_cirugia: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      hora_inicio: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      hora_fin: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      diagnostico_preoperatorio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      procedimiento: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      estado_cirugia: {
        type: DataTypes.STRING(50),
        defaultValue: "PROGRAMADA",
      },

      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },

    {
      tableName: "cirugias",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Cirugia.associate = (models) => {

    Cirugia.belongsTo(models.Paciente, {
      foreignKey: "id_paciente",
      as: "paciente",
    });

    Cirugia.belongsTo(models.Medico, {
      foreignKey: "id_medico",
      as: "medico",
    });

    Cirugia.belongsTo(models.TipoCirugia, {
      foreignKey: "id_tipo_cirugia",
      as: "tipoCirugia",
    });
  };

  return Cirugia;
};