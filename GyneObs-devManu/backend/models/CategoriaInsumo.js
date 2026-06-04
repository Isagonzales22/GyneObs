module.exports = (sequelize, DataTypes) => {
  const CategoriaInsumo = sequelize.define(
    "CategoriaInsumo",
    {
      id_categoria_insumo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },

    {
      tableName: "categorias_insumo",
      timestamps: false,
    }
  );
CategoriaInsumo.associate = (models) => {
  CategoriaInsumo.hasMany(models.InsumoMedico, {
    foreignKey: "id_categoria_insumo",
    as: "insumos",
  });
};


  return CategoriaInsumo;
};
