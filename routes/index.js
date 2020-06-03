var express = require('express');
var router = express.Router();
const Schedule = require('../models/schedule');

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = '予定調整くん';
  if (req.user) {
    // findAll 条件があるデータモデルに対応するレコードを全て取得する関数
    Schedule.findAll({
      where: {
        createdBy: req.user.id
      },
      order: [['updatedAt', 'DESC']]// 作成日時でソート
    }).then(schedules => {
      res.render('index', {
        title: title,
        user: req.user,
        schedules: schedules
      });
    });
  } else {
    res.render('index', { title: 'Express', user: req.user });
  }
});

module.exports = router;
