const jwt = require('jsonwebtoken');
const config = require("./config");

exports.adminSecurity = async (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token && token.startsWith('Bearer ')) {
        token = token.substring(7, token.length);
    } else {
        return res.status(401).json('token_required');
    }

    jwt.verify(token, config.adminSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json('token_not_valid');
        }
        else {
            if(decoded.admin !== process.env.ADMIN_SECRET){
                return res.status(401).json('token_not_valid');
            }
            else if (decoded.name !== process.env.ADMIN_NAME){
                return res.status(401).json('token_not_valid');
            }
            else {
                next();
            }
        }
    })
}