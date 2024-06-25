'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Token.init(
    {
      tiktok_token_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      access_token: DataTypes.STRING,
      refresh_token: DataTypes.STRING,
      expires_in: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Token',
      tableName: 'tiktok_tokens',
      underscored: true,
    }
  )
  return Token
}
