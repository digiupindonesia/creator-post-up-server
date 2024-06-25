'use strict'
const { Model } = require('sequelize')
const { Sequelize } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class SavedPrompt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SavedPrompt.belongsTo(models.Batch, {
        foreignKey: 'batch_id',
        targetKey: 'batch_id',
      })
    }
  }
  SavedPrompt.init(
    {
      saved_prompt_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Batches',
          key: 'batch_id',
        },
      },
      hook: DataTypes.ARRAY(DataTypes.TEXT),
      main1: DataTypes.ARRAY(DataTypes.TEXT),
      main2: DataTypes.ARRAY(DataTypes.TEXT),
      main3: DataTypes.ARRAY(DataTypes.TEXT),
      main4: DataTypes.ARRAY(DataTypes.TEXT),
      main5: DataTypes.ARRAY(DataTypes.TEXT),
      main6: DataTypes.ARRAY(DataTypes.TEXT),
      main7: DataTypes.ARRAY(DataTypes.TEXT),
      main8: DataTypes.ARRAY(DataTypes.TEXT),
      cta: DataTypes.ARRAY(DataTypes.TEXT),
    },
    {
      sequelize,
      modelName: 'SavedPrompt',
      tableName: 'saved_prompts',
      underscored: true,
    }
  )
  return SavedPrompt
}
