const jwt = require('jsonwebtoken');
const config = require("./config");

const User = require("../schema/schemaUser");
const tokenList = require("./tokenList");

exports.checkAuth = async (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    let refresh = req.headers['refresh'];
    if (token && token.startsWith('Bearer ')) {
        token = token.substring(7, token.length);
    } else {
        return res.status(401).json('token_required');
    }
    if (!refresh) {
        return res.status(401).json('refresh_token_required');
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).json('token_not_valid');
        } else if (decoded.id in tokenList && tokenList[decoded.id].token === token && tokenList[decoded.id].refreshToken === refresh) {
            const findUser = User.findById(decoded.id);
            if (!findUser) {
                return res.status(401).json('Error : bad token');
            } else {
                next();
            }
        } else {
            return res.status(401).json('Error : user not valid');
        }
    })
}