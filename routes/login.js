'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    // open login.pug file
    res.render('login', {user: req.user});
});

module.exports = router;