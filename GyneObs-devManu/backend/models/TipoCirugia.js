module.exports = (sequelize, DataTypes) => {
  const TipoCirugia = sequelize.define(
    "TipoCirugia",
    {
      id_tipo_cirugia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      duracion_estimada_minutos: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },

    {
      tableName: "tipos_cirugia",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  TipoCirugia.associate = (models) => {
  TipoCirugia.hasMany(models.Cirugia, {
    foreignKey: "id_tipo_cirugia",
    as: "cirugias",
  });
};


  return TipoCirugia;
};