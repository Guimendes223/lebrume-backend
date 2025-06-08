'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CompanionProfiles', 'profileCompleteness', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('CompanionProfiles', 'isApproved', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('CompanionProfiles', 'approvedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'approvedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('CompanionProfiles', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'isVisible', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('CompanionProfiles', 'displayName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'locationCity', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'locationState', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'locationCountry', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'aboutMe', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'servicesSummary', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'ratesSummary', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'contactPhone', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'contactEmail', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'profilePictureUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('CompanionProfiles', 'privacySettings', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    });

    await queryInterface.addColumn('CompanionProfiles', 'availabilityStatus', {
      type: Sequelize.ENUM('Available', 'Busy', 'Away', 'Offline'),
      defaultValue: 'Offline'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('CompanionProfiles', 'profileCompleteness');
    await queryInterface.removeColumn('CompanionProfiles', 'isApproved');
    await queryInterface.removeColumn('CompanionProfiles', 'approvedAt');
    await queryInterface.removeColumn('CompanionProfiles', 'approvedBy');
    await queryInterface.removeColumn('CompanionProfiles', 'rejectionReason');
    await queryInterface.removeColumn('CompanionProfiles', 'isVisible');
    await queryInterface.removeColumn('CompanionProfiles', 'displayName');
    await queryInterface.removeColumn('CompanionProfiles', 'locationCity');
    await queryInterface.removeColumn('CompanionProfiles', 'locationState');
    await queryInterface.removeColumn('CompanionProfiles', 'locationCountry');
    await queryInterface.removeColumn('CompanionProfiles', 'aboutMe');
    await queryInterface.removeColumn('CompanionProfiles', 'servicesSummary');
    await queryInterface.removeColumn('CompanionProfiles', 'ratesSummary');
    await queryInterface.removeColumn('CompanionProfiles', 'contactPhone');
    await queryInterface.removeColumn('CompanionProfiles', 'contactEmail');
    await queryInterface.removeColumn('CompanionProfiles', 'profilePictureUrl');
    await queryInterface.removeColumn('CompanionProfiles', 'privacySettings');
    await queryInterface.removeColumn('CompanionProfiles', 'availabilityStatus');
  }
};
