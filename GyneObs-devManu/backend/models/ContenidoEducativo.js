module.exports = (sequelize, DataTypes) => {
  const ContenidoEducativo = sequelize.define(
    "ContenidoEducativo",
    {
      id_contenido: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_categoria_educativa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      tipo_contenido: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      contenido_texto: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      url_video: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      archivo_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      imagen_portada_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      autor: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      estado: {
        type: DataTypes.STRING(50),
        defaultValue: "BORRADOR",
      },

      fecha_publicacion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },

    {
      tableName: "contenidos_educativos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  ContenidoEducativo.associate = (models) => {

    ContenidoEducativo.belongsTo(models.CategoriaEducativa, {
      foreignKey: "id_categoria_educativa",
      as: "categoria",
    });

    ContenidoEducativo.belongsTo(models.Usuario, {
      foreignKey: "autor",
      as: "autorUsuario",
    });
  };

  return ContenidoEducativo;
};