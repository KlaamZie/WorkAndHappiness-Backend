const Entreprise = require("../../../schema/schemaEntreprise.js");
const User = require("../../../schema/schemaUser.js");

const jwt = require('jsonwebtoken');
const config = require("../../../config/config");

async function makeAdmin(req, res) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    let userData = jwt.verify(token, config.secret);

    let idEntreprise = await User.findById(userData.id)
    if(!idEntreprise.isAdmin) {
        return res.status(401).json({
            text: "Vous n'êtes pas administrateur, vous ne pouvez pas faire ça !"
        });
    }
    idEntreprise = idEntreprise.idEntreprise;

    const {email} = req.body;

    try {
        const findUser = await User.findOne({email})
        const findEntreprise = await Entreprise.findById(idEntreprise);

        findUser.isAdmin = true;
        findUser.isModo = true;
        findUser.save();

        const find = findEntreprise.validatedEmployees.findIndex(employee => employee.email === email);
        findEntreprise.validatedEmployees[find].isAdmin = true;
        findEntreprise.validatedEmployees[find].isModo = true;
        findEntreprise.save();

        return res.status(200).json({
            text: "L'utilisateur est maintenant Administrateur !"
        });
    } catch (error) {
        return res.status(500).json({error});
    }

}

exports.makeAdmin = makeAdmin;

async function makeModo(req, res) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    let userData = jwt.verify(token, config.secret);

    let idEntreprise = await User.findById(userData.id)
    if(!idEntreprise.isAdmin || !idEntreprise.isModo) {
        return res.status(401).json({
            text: "Vous n'êtes pas administrateur ni modérateur, vous ne pouvez pas faire ça !"
        });
    }
    idEntreprise = idEntreprise.idEntreprise;

    const {email} = req.body;

    try {
        const findUser = await User.findOne({email})
        const findEntreprise = await Entreprise.findById(idEntreprise);

        findUser.isAdmin = false;
        findUser.isModo = true;
        findUser.save();

        const find = findEntreprise.validatedEmployees.findIndex(employee => employee.email === email);
        findEntreprise.validatedEmployees[find].isAdmin = false;
        findEntreprise.validatedEmployees[find].isModo = true;
        findEntreprise.save();

        return res.status(200).json({
            text: "L'utilisateur est maintenant Modérateur !"
        });
    } catch (error) {
        return res.status(500).json({error});
    }
}

exports.makeModo = makeModo;

async function makeUser(req, res) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    let userData = jwt.verify(token, config.secret);

    let idEntreprise = await User.findById(userData.id)
    if(!idEntreprise.isAdmin || !idEntreprise.isModo) {
        return res.status(401).json({
            text: "Vous n'êtes pas administrateur ni modérateur, vous ne pouvez pas faire ça !"
        });
    }
    idEntreprise = idEntreprise.idEntreprise;

    const {email} = req.body;

    try {
        const findUser = await User.findOne({email})
        const findEntreprise = await Entreprise.findById(idEntreprise);

        findUser.isAdmin = false;
        findUser.isModo = false;
        findUser.save();

        const find = findEntreprise.validatedEmployees.findIndex(employee => employee.email === email);
        findEntreprise.validatedEmployees[find].isAdmin = false;
        findEntreprise.validatedEmployees[find].isModo = false;
        findEntreprise.save();

        return res.status(200).json({
            text: "L'utilisateur est maintenant simple utilisateur !"
        });
    } catch (error) {
        return res.status(500).json({error});
    }
}

exports.makeUser = makeUser;