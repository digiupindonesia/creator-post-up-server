'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class TiktokAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association hereA
    }
  }
  TiktokAccount.init(
    {
      tiktok_account_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: DataTypes.STRING,
      token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'TiktokAccount',
      tableName: 'tiktok_accounts',
      underscored: true,
    }
  )
  return TiktokAccount
}
