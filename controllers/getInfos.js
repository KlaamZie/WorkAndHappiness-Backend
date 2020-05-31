const Entreprise = require("../schema/schemaEntreprise.js");
const User = require("../schema/schemaUser");

const jwt = require('jsonwebtoken');
const config = require("../config/config");

const tokenList = require("../config/tokenList");

async function getInfos(req, res) {

    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);

    try {
        let userData = jwt.verify(token, config.secret);

        const findUser = await User.findById(userData.id)
        const findEntreprise = await Entreprise.findById(findUser.idEntreprise);

        let userToken = res.locals.userToken;
        let refreshToken = res.locals.refreshToken;

        return res.status(200).json({
            userToken,
            refreshToken,
            user: findUser,
            entreprise: findEntreprise
        });

    } catch (error) {
        return res.status(500).json({error});
    }

}

exports.getInfos = getInfos;
