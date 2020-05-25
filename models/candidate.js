'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Candidate = loader.database.define(
    'candidates',
    {
        candidateId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true, // 自動連番
            allowNull: false,
        },
        candidateName: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        scheduleId: {
            type: Sequelize.UUID,
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        timestamp: false,
        indexes: [
            {
                fields: ['scheduleId']
            }
        ]
    }
);

module.exports = Candidate;