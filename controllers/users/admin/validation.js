const Entreprise = require("../../../schema/schemaEntreprise.js");
const User = require("../../../schema/schemaUser.js");

const jwt = require('jsonwebtoken');
const config = require("../../../config/config");

async function mailValidEmployee(email, firstname, entreprise) {
    let request = require("request");

    let mail = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":10, "params":{"firstname":"${firstname}", "entreprise":"${entreprise}"}}`
    };

    await request(mail, function(error, response, body) {
        if (error) {
            return;
        }
    });
}

async function validEmployee(req, res) {

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

    const { email } = req.body

    try {
        const findUser = await User.findOne({ email });
        const findEntreprise = await Entreprise.findById(idEntreprise);

        let uid = findUser._id;
        let firstname = findUser.firstname;
        let lastname = findUser.lastname;
        let isAdmin = findUser.isAdmin;
        let isModo = findUser.isModo;

        const addUserToValidate = {
            uid,
            email,
            firstname,
            lastname,
            isAdmin,
            isModo
        };

        findUser.isValidate = true;
        findUser.idEntreprise = findEntreprise._id;
        findUser.waitingEntreprise = 0;
        findUser.save();

        let addToValidated = findEntreprise.validatedEmployees.slice();
        addToValidated.push(addUserToValidate);
        findEntreprise.validatedEmployees = addToValidated;

        const find = findEntreprise.employeesToValidate.findIndex(employee => employee.email === email)
        findEntreprise.employeesToValidate.splice(find, 1)

        findEntreprise.save();

        mailValidEmployee(findUser.email, findUser.firstname, findEntreprise.name);

        return res.status(200).json({
            text: "Utilisateur validé"
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }

}

exports.validEmployee = validEmployee;

async function mailDeleteValidated(email, firstname, entreprise) {
    let request = require("request");

    let mail = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":8, "params":{"firstname":"${firstname}", "entreprise":"${entreprise}"}}`
    };

    await request(mail, function(error, response, body) {
        if (error) {
            return;
        }
    });
}

async function deleteValidatedEmployee(req, res) {

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

    const { email } = req.body;

    try {
        const findUser = await User.findOne({ email });
        const findEntreprise = await Entreprise.findById(idEntreprise);

        if(findUser.isAdmin){
            findUser.isAdmin = false;
        }
        if(findUser.isModo){
            findUser.isModo = false;
        }
        findUser.isValidate = false;
        findUser.idEntreprise = 18121995;
        findUser.waitingEntreprise = 0;
        findUser.save();

        const find = findEntreprise.validatedEmployees.findIndex(employee => employee.email === email)
        findEntreprise.validatedEmployees.splice(find, 1)

        findEntreprise.save();

        mailDeleteValidated(findUser.email, findUser.firstname, findEntreprise.name);

        return res.status(200).json({
            text: "Employé supprimé"
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }

}

exports.deleteValidatedEmployee = deleteValidatedEmployee;

async function mailDeleteToValidate(email, firstname, entreprise) {
    let request = require("request");

    let mail = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":9, "params":{"firstname":"${firstname}", "entreprise":"${entreprise}"}}`
    };

    await request(mail, function(error, response, body) {
        if (error) {
            return;
        }
    });
}

async function deleteToValidateEmployee(req, res) {

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

    const { email } = req.body;

    try {
        const findUser = await User.findOne({ email });
        const findEntreprise = await Entreprise.findById(idEntreprise);

        findUser.isValidate = false;
        findUser.waitingEntreprise = 0;
        findUser.save();

        const find = findEntreprise.employeesToValidate.findIndex(employee => employee.email === email)
        findEntreprise.employeesToValidate.splice(find, 1)

        findEntreprise.save();

        mailDeleteToValidate(findUser.email, findUser.firstname, findEntreprise.name);

        return res.status(200).json({
            text: "Demande de validation supprimé"
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }

}

exports.deleteToValidateEmployee = deleteToValidateEmployee;
