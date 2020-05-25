'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const User = loader.database.define(
    'users',
    {
        userId: {
            type: Sequelize.INTEGER, // null を許容しない
            primaryKey: true,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING, // null を許容しない
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

module.exports = User;