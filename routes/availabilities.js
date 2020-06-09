'use strict';
const express = require('express');
const router = express.Router();
const autheticationEnsurer = require('./authentication-ensurer');
const Availability = require('../models/availabilitiy');

router.post(
    '/:scheduleId/users/:userId/candidates/:candidateId',
    autheticationEnsurer,
    (req, res, next) => {
        const scheduleId = req.params.scheduleId;
        const userId = req.params.userId;
        const candidateId = req.params.candidateId;
        let availability = req.body.availability;
        availability = availability ? parseInt(availability) : 0;

        // upsert = 更新
        Availability.upsert({
                scheduleId: scheduleId,
                userId: userId,
                candidateId: candidateId,
                availability: availability
        }).then(() => {
           res.json({ status: 'OK', availability: availability });
        });
    }
);

module.exports = router;