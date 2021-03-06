'use strict';
const express = require('express');
const router = express.Router();
const autheticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Schedule = require('../models/schedule');
const Candidate = require('../models/candidate');
const User = require('../models/user');
const Availability = require('../models/availabilitiy');

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
                // データベースからその予定の全ての出欠を取得する
                Availability.findAll({
                    include: [
                        {
                            model: User,
                            attributes: ['userId', 'username']
                        }
                    ],
                    where: { scheduleId: schedule.scheduleId },
                    order: [[User, 'username', 'ASC'], ['candidateId', 'ASC']]
                }).then((availabilities) => {
                    // 出欠 MapMap(キー:ユーザーID, 値:出欠Map(キー:候補ID, 値:出欠)) を作成する
                    const availabilityMapMap = new Map(); // key: userId, value: Map(key: candidateId, availability)
                    availabilities.forEach((a) => {
                       const map = availabilityMapMap.get(a.user.userId) || new Map();
                       map.set(a.candidateId, a.availability);
                       availabilityMapMap.set(a.user.userId, map);
                    });

                    // 閲覧ユーザーと出欠に紐づくユーザーからユーザー Map (キー:ユーザーID, 値:ユーザー) を作る
                    const userMap = new Map(); // key: userId, value: User
                    userMap.set(parseInt(req.user.id), {
                        isSelf: true,
                        userId: parseInt(req.user.id),
                        username: req.user.username
                    });
                    availabilities.forEach((a) => {
                        userMap.set(a.user.userId, {
                            isSelf: parseInt(req.user.userId) === a.user.userId, // 閲覧ユーザー自身であるか
                            userId: a.user.userId,
                            username: a.user.username
                        });
                    });

                    // 全ユーザー、全候補で二重ループしてそれぞれの出欠の値がない場合には「欠席」を設定する
                    const users = Array.from(userMap).map((keyValue) => keyValue[1]);
                    users.forEach((u) => {
                        candidates.forEach((c) => {
                            const map = availabilityMapMap.get(u.userId) || new Map();
                            const a = map.get(c.candidateId) || 0; // デフォルト値は 0 を利用
                            map.set(c.candidateId, a);
                            availabilityMapMap.set(u.userId, map);
                        });
                    });

                    // console.log(availabilityMapMap); // TODO: 除去する

                    // レンダリング用の変数 schedule
                    res.render('schedule', {
                        user: req.user,
                        schedule: schedule,
                        candidates: candidates,
                        // users: [req.user],
                        users: users,
                        availabilityMapMap: availabilityMapMap
                    });
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