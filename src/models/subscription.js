'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Subscription extends Model {
    static associate(models) {
      // Associação com o modelo User (usuário que assina)
      Subscription.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      
      // Associação com o modelo Plan (plano ao qual a assinatura pertence)
      Subscription.belongsTo(models.Plan, { foreignKey: 'planId', as: 'plan' });
    }
  }

  Subscription.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',  // Nome da tabela de usuários
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Plans', // Nome da tabela de planos
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Expired', 'Cancelled', 'PendingPayment'),
      allowNull: false,
      defaultValue: 'PendingPayment',
    },
    paymentTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'Subscriptions',
  });

  return Subscription;
};
