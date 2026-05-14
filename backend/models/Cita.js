module.exports = (sequelize, DataTypes) => {
  const Cita = sequelize.define(
    "Cita",
    {
      id_cita: {
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

      id_tipo_consulta: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      fecha_cita: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false,
      },

      hora_fin: {
        type: DataTypes.TIME,
        allowNull: false,
      },

      estado_cita: {
        type: DataTypes.STRING(50),
        defaultValue: "PENDIENTE",
      },

      motivo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      creada_por: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },

    {
      tableName: "citas",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Cita.associate = (models) => {

    Cita.belongsTo(models.Paciente, {
      foreignKey: "id_paciente",
      as: "paciente",
    });

    Cita.belongsTo(models.Medico, {
      foreignKey: "id_medico",
      as: "medico",
    });

    Cita.belongsTo(models.TipoConsulta, {
      foreignKey: "id_tipo_consulta",
      as: "tipoConsulta",
    });

    Cita.belongsTo(models.Usuario, {
      foreignKey: "creada_por",
      as: "usuarioCreador",
    });
  };

  return Cita;
};