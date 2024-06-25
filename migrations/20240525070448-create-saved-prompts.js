'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('saved_prompts', {
      saved_prompt_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      batch_id: {
        type: Sequelize.INTEGER,
      },
      hook: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      main1: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      main2: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      main3: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      main4: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      main5: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      main6: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      main7: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      main8: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },

      cta: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('saved_prompts')
  },
}
