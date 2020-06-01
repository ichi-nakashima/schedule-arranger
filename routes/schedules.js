'use strict';
const express = require('express');
const router = express.Router();
const autheticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Schedule = require('../models/schedule');
const Candidate = require('../models/candidate');

router.get('/new', autheticationEnsurer, (req, res, next) => {
   res.render('new', {user: req.user});
});

router.post('/', autheticationEnsurer, (req, res, next) => {
    const scheduleId = uuid.v4();
    const updateAt = new Date();
    Schedule.create({
       scheduleId: scheduleId,
       scheduleName: req.body.scheduleName.slice(0, 255) || '(名称未設定)',
       memo: req.body.memo,
       createdBy: req.user.id,
       updatedAt: updateAt
    }).then((schedule))
});

module.exports = router;