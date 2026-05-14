module.exports = (sequelize, DataTypes) => {
  const Medico = sequelize.define(
    "Medico",
    {
      id_medico: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_usuario: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },

      especialidad: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      matricula_profesional: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      telefono_consultorio: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },

      firma_digital_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },

    {
      tableName: "medicos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Medico.associate = (models) => {

    Medico.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario",
    });

Medico.hasMany(models.HistoriaClinica, {
  foreignKey: "id_medico",
  as: "historiasClinicas",
 });

Medico.hasMany(models.ConsultaMedica, {
  foreignKey: "id_medico",
  as: "consultas",
});
Medico.hasMany(models.Cirugia, {
  foreignKey: "id_medico",
  as: "cirugias",
});

// Medico.hasMany(models.Cita, {
//   foreignKey: "id_medico",
//   as: "citas",
// });

 
  };

  return Medico;
};