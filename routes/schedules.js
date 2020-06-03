'use strict';
const express = require('express');
const router = express.Router();
const autheticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Schedule = require('../models/schedule');
const Candidate = require('../models/candidate');
const User = require('../models/user');

router.get('/new', autheticationEnsurer, (req, res, next) => {
   res.render('new', {user: req.user});
});

router.post('/', autheticationEnsurer, (req, res, next) => {
    const scheduleId = uuid.v4();
    const updateAt = new Date();
    // 予定を DB に保存
    Schedule.create({
       scheduleId: scheduleId,
       // 1. DB に限りがあるので、255 文字以内にします。
       // 2. 空の文字列を入力した場合は、予定名を'(名称未設定)'として保存させる
       scheduleName: req.body.scheduleName.slice(0, 255) || '(名称未設定)',
       memo: req.body.memo,
       createdBy: req.user.id,
       updatedAt: updateAt
    }).then((schedule) => {
        const candidateNames = req.body.candidates.trim().split('\n').map((s) => s.trim()).filter((s) => s !== "");
        const candidates = candidateNames.map((c) => { return {
            candidateName: c,
            scheduleId: schedule.scheduleId
        }
        });
        // 候補日を DB に保存
        Candidate.bulkCreate(candidates).then(() => {
           // リダイレクト
           res.redirect('/schedules/' + schedule.scheduleId);
        });
    });
});

router.get('/:scheduleId', autheticationEnsurer, (req, res, next) => {
    Schedule.findOne({
        // include 欲しいカラム
        include: [
            {
                model: User,
                attributes: ['userId', 'username']
            }
        ],
        where: {
            scheduleId: req.params.scheduleId
        },
        order: [['updatedAt', 'DESC']]
    }).then((schedule) => {
        if (schedule) {
            Candidate.findAll({
                where: { scheduleId: schedule.scheduleId },
                order: [['candidateId', 'ASC']]
            }).then((candidates) => {
               res.render('schedule', {
                   user: req.user,
                   schedule: schedule,
                   candidates: candidates,
                   users: [req.user]
               });
            });
        } else {
            const err = new Error('指定された予定は見つかりません');
            err.status = 404;
            next(err);
        }
    });
});

module.exports = router;