const jwt = require('jsonwebtoken');
const config = require("../../../config/config");

const User = require("../../../schema/schemaUser");
const Entreprise = require("../../../schema/schemaEntreprise.js");

const week0 = require("../../../schema/week0.json");
const week1 = require("../../../schema/week1.json");
const week2 = require("../../../schema/week2.json");
const week3 = require("../../../schema/week3.json");
const week4 = require("../../../schema/week4.json");

async function getform(req, res) {

    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    let userData = jwt.verify(token, config.secret);
    const findUser = await User.findById(userData.id)
    const idEntreprise = findUser.idEntreprise;

    try {
        const findEntreprise = await Entreprise.findById(idEntreprise);
        if (findEntreprise.firstWeek === true) {
            return res.status(200).json({
                form: week0
            });
        }
        if (findEntreprise.actualWeek === 1) {
            return res.status(200).json({
                form: week1
            });
        }
        if (findEntreprise.actualWeek === 2) {
            return res.status(200).json({
                form: week2
            });
        }
        if (findEntreprise.actualWeek === 3) {
            return res.status(200).json({
                form: week3
            });
        }
        if (findEntreprise.actualWeek === 4) {
            return res.status(200).json({
                form: week4
            });
        }
    } catch (error) {
        return res.status(500).json({error});
    }

}

exports.getform = getform;
