const jwt = require('jsonwebtoken');
const config = require("../../../config/config");

const User = require("../../../schema/schemaUser.js");

async function validEmail(req, res) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    let userData = jwt.verify(token, config.secret);

    const { email } = req.body;

    if (!email) {
        //Le cas où l'ancien ou le nouveau mot de passe ne serait pas soumit ou nul
        return res.status(400).json({
            text: "Requête invalide"
        });
    }

    try {
        const findUser = await User.findById(userData.id)
        
        if (findUser.email !== email) {
            return res.status(401).json({
                text: "L'adresse mail n'est pas la bonne."
            });
        }

        if (findUser.validEmail) {
            return res.status(401).json({
                text: "L'adresse mail à déjà été validée."
            });
        }

        findUser.validEmail = true;
        findUser.save();
        
        return res.status(200).json({
            text: "Adresse mail validée !"
        });

    }
    catch (error) {
        return res.status(500).json({ error });
    }
}

exports.validEmail = validEmail;
