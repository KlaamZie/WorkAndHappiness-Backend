const User = require("../../../schema/schemaUser.js");
const jwt = require("jsonwebtoken");
const config = require("../../../config/config");

async function changeRgpd(req, res) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    let userData = jwt.verify(token, config.secret);

    let findUser = await User.findById(userData.id);
    const { weeklyMail, monthlyMail } = req.body;

    try {
        findUser.weeklyMail = weeklyMail;
        findUser.monthlyMail = monthlyMail;
        
        findUser.save();
        
        return res.status(200).json({
            text: "Paramètres de confidentialités modifiés !"
        });

    }
    catch (error) {
        return res.status(500).json({ error });
    }
}

exports.changeRgpd = changeRgpd;
