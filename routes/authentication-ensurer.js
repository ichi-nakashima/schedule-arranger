'use strict';
// 認証を確かめるハンドラ関数
function ensure(req, res, next) {
    // 認証チェックをして、認証がない場合には /login にリダイレクトする
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = ensure;