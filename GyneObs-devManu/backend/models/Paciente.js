module.exports = (sequelize, DataTypes) => {
  const Paciente = sequelize.define(
    "Paciente",
    {
      id_paciente: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      codigo_paciente: {
        type: DataTypes.STRING(30),
        allowNull: true,
        unique: true,
      },
      ocupacion: DataTypes.STRING(100),
      estado_civil: DataTypes.STRING(50),
      seguro_medico: DataTypes.STRING(100),
      tipo_sangre: DataTypes.STRING(10),
      referencia: DataTypes.STRING(100),
      contacto_emergencia_nombre: DataTypes.STRING(150),
      contacto_emergencia_telefono: DataTypes.STRING(30),
      contacto_emergencia_parentesco: DataTypes.STRING(50),
      observaciones: DataTypes.TEXT,
    },
    {
      tableName: "pacientes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Paciente.associate = (models) => {
    Paciente.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario",
    });
    
    Paciente.hasOne(models.HistoriaClinica, {
    foreignKey: "id_paciente",
    as: "historiaClinica",
    });

  
  };

  return Paciente;
};