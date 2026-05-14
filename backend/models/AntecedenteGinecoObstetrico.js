module.exports = (sequelize, DataTypes) => {
  const AntecedenteGinecoObstetrico = sequelize.define(
    "AntecedenteGinecoObstetrico",
    {
      id_antecedente_go: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_historia_clinica: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      fum: DataTypes.DATEONLY,
      fum_desconocida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      descripcion_fum: DataTypes.TEXT,
      menarquia: DataTypes.STRING(50),
      ritmo_menstrual: DataTypes.STRING(100),
      ciclos_irregulares: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      duracion_menstruacion: DataTypes.STRING(100),
      cantidad_sangrado: DataTypes.STRING(100),
      dolor_menstrual: DataTypes.BOOLEAN,
      sangrado_anormal: DataTypes.TEXT,
      fecha_ultimo_pap: DataTypes.DATEONLY,
      resultado_pap: DataTypes.STRING(150),
      pap_observacion: DataTypes.TEXT,
      metodo_anticonceptivo: DataTypes.STRING(150),
      gestas: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      partos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      cesareas: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      abortos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      abortos_provocados: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      abortos_espontaneos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      hijos_vivos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      observaciones_obstetricas: DataTypes.TEXT,
    },
    {
      tableName: "antecedentes_gineco_obstetricos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  AntecedenteGinecoObstetrico.associate = (models) => {
    AntecedenteGinecoObstetrico.belongsTo(models.HistoriaClinica, {
      foreignKey: "id_historia_clinica",
      as: "historiaClinica",
    });
  };

  return AntecedenteGinecoObstetrico;
};