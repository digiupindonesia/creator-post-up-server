'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      birthday: DataTypes.STRING,
      number_phone: DataTypes.STRING,
      
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
    }
  )
  return User
}
