'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Availability = loader.database.define(
    'availabilities',
    {
        candidateId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        userId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        availability: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        scheduleId: {
            type: Sequelize.UUID,
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
        indexes: [
            {
                // 検索のために scheduleId にインデックスを使用
                fields: ['scheduleId']
            }
        ]
    }
);

module.exports = Availability;