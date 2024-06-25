'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Auth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Auth.init(
    {
      auth_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: 'username cannot be null, field cannot be empty',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: {
            msg: 'email cannot be null, field cannot be empty',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [6, 20],
            msg: 'must be char and length between 6 and 20',
            notEmpty: {
              msg: 'password cannot be null, field cannot be empty',
            },
          },
        },
      },
      access_token: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Auth',
      tableName: 'auths',
      underscored: true,
    }
  )
  return Auth
}
