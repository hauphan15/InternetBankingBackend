const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header['x-access-token'];

    if (token) {
        jwt.verify(token, 'secretkey', function(err, payload) {
            if (err) {
                return res.json({
                    tokenSuccess: false,
                    message: err
                })
            }

            req.tokenPayload = payload;
            next();
        })
    } else {
        return res.json({
            tokenSuccess: false,
            message: 'no access token found'
        })
    }
}