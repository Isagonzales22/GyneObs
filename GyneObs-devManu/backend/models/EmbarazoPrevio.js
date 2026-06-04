module.exports = (sequelize, DataTypes) => {
  const EmbarazoPrevio = sequelize.define(
    "EmbarazoPrevio",
    {
      id_embarazo_previo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_historia_clinica: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      numero_gesta: DataTypes.STRING(20),
      nombre_hijo: DataTypes.STRING(150),
      fecha_nacimiento: DataTypes.DATEONLY,
      anio_nacimiento: DataTypes.INTEGER,
      tipo_parto: DataTypes.STRING(50),
      edad_gestacional: DataTypes.STRING(50),
      peso_nacimiento: DataTypes.STRING(50),
      complicaciones: DataTypes.TEXT,
      observaciones: DataTypes.TEXT,
    },
    {
      tableName: "embarazos_previos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  EmbarazoPrevio.associate = (models) => {
    EmbarazoPrevio.belongsTo(models.HistoriaClinica, {
      foreignKey: "id_historia_clinica",
      as: "historiaClinica",
    });
  };

  return EmbarazoPrevio;
};