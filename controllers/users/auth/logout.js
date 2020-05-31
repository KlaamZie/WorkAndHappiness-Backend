const jwt = require('jsonwebtoken');
const config = require("../../../config/config");
const tokenList = require("../../../config/tokenList");

async function logout(req, res) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).json('token_not_valid');
        }
        else if (decoded.id in tokenList) {
            let user = decoded.id;
            delete tokenList[user];
            return res.status(200).json({
                text: "Logout réussi"
            });
        } else {
            return res.status(401).json("L'utilisateur n'est pas connecter");
        }
    })
}

exports.logout = logout;
