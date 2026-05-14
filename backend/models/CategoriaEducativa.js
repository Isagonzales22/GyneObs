module.exports = (sequelize, DataTypes) => {
  const CategoriaEducativa = sequelize.define(
    "CategoriaEducativa",
    {
      id_categoria_educativa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descripcion: DataTypes.TEXT,
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "categorias_educativas",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
CategoriaEducativa.associate = (models) => {
  CategoriaEducativa.hasMany(models.ContenidoEducativo, {
    foreignKey: "id_categoria_educativa",
    as: "contenidos",
  });
};


  return CategoriaEducativa;
};