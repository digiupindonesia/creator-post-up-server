'use strict'

const auths = require('../helper/auth')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('auths', [
      {
        username: 'betauser',
        email: 'beta@aero.com',
        password: auths.hashPassword('inisangatrahasia'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'betauser2',
        email: 'beta2@aero.com',
        password: auths.hashPassword('inisangatrahasia'),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('auths', null, {})
  },
}
