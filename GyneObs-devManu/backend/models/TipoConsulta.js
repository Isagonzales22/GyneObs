module.exports = (sequelize, DataTypes) => {
  const TipoConsulta = sequelize.define(
    "TipoConsulta",
    {
      id_tipo_consulta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descripcion: DataTypes.TEXT,
      duracion_minutos: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
      },
      precio_referencial: DataTypes.DECIMAL(10, 2),
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "tipos_consulta",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  TipoConsulta.associate = (models) => {
     TipoConsulta.hasMany(models.Cita, {
      foreignKey: "id_tipo_consulta",
      as: "citas",
     });
  };

  return TipoConsulta;
};