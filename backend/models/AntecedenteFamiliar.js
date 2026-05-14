module.exports = (sequelize, DataTypes) => {
  const AntecedenteFamiliar = sequelize.define(
    "AntecedenteFamiliar",
    {
      id_antecedente_familiar: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_historia_clinica: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      antecedentes_madre: DataTypes.TEXT,
      antecedentes_padre: DataTypes.TEXT,
      antecedentes_abuelos: DataTypes.TEXT,
      antecedentes_hermanos: DataTypes.TEXT,
      antecedentes_pareja: DataTypes.TEXT,
      antecedentes_familia_pareja: DataTypes.TEXT,
      cancer_familiar: DataTypes.TEXT,
      diabetes_familiar: DataTypes.TEXT,
      hipertension_familiar: DataTypes.TEXT,
      otros_antecedentes: DataTypes.TEXT,
    },
    {
      tableName: "antecedentes_familiares",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  AntecedenteFamiliar.associate = (models) => {
    AntecedenteFamiliar.belongsTo(models.HistoriaClinica, {
      foreignKey: "id_historia_clinica",
      as: "historiaClinica",
    });
  };

  return AntecedenteFamiliar;
};