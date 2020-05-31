const User = require("../../../schema/schemaUser.js");

const tokenList = require("../../../config/tokenList");

async function login(req, res) {
    const {password, email} = req.body;
    if (!email || !password) {
        //Le cas où l'email ou bien le password ne serait pas soumit ou nul
        return res.status(400).json({
            text: "Requête invalide"
        });
    }
    try {
        // On check si l'utilisateur existe en base
        const findUser = await User.findOne({email});
        if (!findUser) {
            return res.status(401).json({
                text: "L'utilisateur n'existe pas"
            });
        }
        if (!findUser.authenticate(password)) {
            return res.status(401).json({
                text: "Mot de passe incorrect"
            });
        }

        let userToken = findUser.getUserToken();
        let refreshToken = findUser.getRefreshToken();

        const response = {
            "status": "Logged in",
            "token": userToken,
            "refreshToken": refreshToken,
        }

        if (!(findUser._id in tokenList)) {
            tokenList[findUser._id] = response;
        }

        return res.status(200).json({
            token: tokenList[findUser._id].token,
            refreshToken: tokenList[findUser._id].refreshToken,
            text: "Authentification réussi"
        });
    } catch (error) {
        return res.status(500).json({
            error
        });
    }
}

exports.login = login;
