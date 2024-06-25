'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Batch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Batch.hasMany(models.SavedPrompt, {
        foreignKey: 'batch_id',
        targetKey: 'batch_id',
      })
    }
  }
  Batch.init(
    {
      batch_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      combination_path: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.STRING)),
      status: DataTypes.STRING,
      type: DataTypes.STRING,
      description: DataTypes.STRING,
      totalCount: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Batch',
      tableName: 'batches',
      underscored: true,
    }
  )
  return Batch
}
