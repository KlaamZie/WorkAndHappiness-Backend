const User = require("../../../schema/schemaUser.js");
const Entreprise = require("../../../schema/schemaEntreprise.js");
const jwt = require("jsonwebtoken");
const config = require("../../../config/config");

const getDate = new Date();
let day = getDate.getDate();
let month = getDate.getMonth() + 1;
let year = getDate.getFullYear();
if (month < 10) {
    month = "0" + month.toString();
}
const date = day + "/" + month + "/" + year;
const hour = getDate.getHours() + " heure et " + getDate.getMinutes() + " minutes";

async function mailChangeEmail(email, newEmail, firstname) {

    let request = require("request");

    let emailChangeMail = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}, {"email":"${newEmail}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":4, "params":{"firstname":"${firstname}", "date":"${date}", "hour":"${hour}"}}`
    };

    await request(emailChangeMail, function (error, response, body) {
        if (error) {
            return this.setState({error: "Une erreur est survenu sur le serveur. Nous vous prions de nous excuser."});
        }
    });
}

async function changeEmail(req, res) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    let userData = jwt.verify(token, config.secret);

    let findUser = await User.findById(userData.id);

    const {previousEmail, newEmail} = req.body;
    if (!newEmail) {
        //Le cas où l'ancien ou le nouvel email passe ne serait pas soumit ou nul
        return res.status(400).json({
            text: "Requête invalide"
        });
    }

    try {
        if (findUser.email !== previousEmail) {
            return res.status(401).json({
                text: "L'ancienne adresse mail n'est pas la bonne."
            });
        }

        await User.findOne({'email': newEmail}, function (err, user) {
            if (user) {
                return res.status(401).json({
                    text: "La nouvelle adresse mail est déjà utilisée."
                });
            }
        });

        findUser.email = newEmail;
        findUser.validEmail = false;
        findUser.save();

        await mailChangeEmail(previousEmail, newEmail, findUser.firstname);

        return res.status(200).json({
            text: "Adresse mail modifiée !"
        });

    } catch (error) {
        return res.status(500).json({error});
    }
}

exports.changeEmail = changeEmail;

const passwordHash = require("password-hash");

async function mailChangePassword(email, firstname) {

    var request = require("request");

    let passwordChangeMail = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":5, "params":{"firstname":"${firstname}", "date":"${date}", "hour":"${hour}"}}`
    };

    await request(passwordChangeMail, function(error, response, body) {
        if (error) {
            return this.setState({ error: "Une erreur est survenu sur le serveur. Nous vous prions de nous excuser." });
        }
    });
}

async function changePassword(req, res) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    let userData = jwt.verify(token, config.secret);

    let findUser = await User.findById(userData.id);

    const { previousPassword, newPassword } = req.body;

    if (!previousPassword || !newPassword) {
        //Le cas où l'ancien ou le nouveau mot de passe ne serait pas soumit ou nul
        return res.status(400).json({
            text: "Requête invalide"
        });
    }

    try {
        if (!passwordHash.verify(previousPassword, findUser.password)) {
            return res.status(401).json({
                text: "L'ancien mot de passe n'est pas le bon"
            });
        }
        let newPasswordHashed = passwordHash.generate(newPassword)
        findUser.password = newPasswordHashed;
        findUser.save();

        await mailChangePassword(findUser.email, findUser.firstname);

        return res.status(200).json({
            text: "Mot de passe modifié !"
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
}

exports.changePassword = changePassword;

async function changeEntreprise(req, res){
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token = token.substring(7, token.length);
    let userData = jwt.verify(token, config.secret);

    let findUser = await User.findById(userData.id);
    const { previousEntrepriseId, newEntrepriseId } = req.body;

    if(!previousEntrepriseId || !newEntrepriseId) {
        return res.status(400).json({
            text: "Requête invalide"
        });
    }

    try {
        // On vérifie que la nouvelle entreprise existe sinon on retourne une erreur
        const findNewEntreprise = await Entreprise.findById(newEntrepriseId);
        if(!findNewEntreprise){
            return res.status(401).json({
                text: "La nouvelle entreprise n'existe pas ou l'identifiant fourni est incorrect."
            });
        }

        let email = findUser.email;
        let firstname = findUser.firstname;
        let lastname = findUser.lastname;
        let waitingEntreprise = findUser.waitingEntreprise;

        // On met l'utilisateur sur la liste de employé à valider de la nouvelle entreprise
        const addUserToValidate = {
            email,
            firstname,
            lastname
        };

        let addToValidate = findNewEntreprise.employeesToValidate.slice();
        addToValidate.push(addUserToValidate);
        findNewEntreprise.employeesToValidate = addToValidate;

        findNewEntreprise.save();

        const findPreviousEntreprise = await Entreprise.findById(previousEntrepriseId);
        if(!findPreviousEntreprise){
            return res.status(401).json({
                text: "Requête invalide"
            });
        }

        // On retire l'utilisateur des listes de son ancienne entreprise (employeesToValidate et validatedEmployees)
        for(let i = 0; i < findPreviousEntreprise.employeesToValidate.length; i++){
            let emailToCompare = findPreviousEntreprise.employeesToValidate[i].email;
            if(emailToCompare === email) {
                findPreviousEntreprise.employeesToValidate.splice(i, 1)
            }
        }

        for(let i = 0; i < findPreviousEntreprise.validatedEmployees.length; i++){
            let emailToCompare = findPreviousEntreprise.validatedEmployees[i].email;
            if(emailToCompare === email) {
                findPreviousEntreprise.validatedEmployees.splice(i, 1);
            }
        }

        findPreviousEntreprise.save();

        const findWaitingEntreprise = await Entreprise.findById(waitingEntreprise);
        if(findWaitingEntreprise){
            // On retire l'utilisateur des listes de l'entreprises où il peut être en attente de validation (employeesToValidate)
            for(let i = 0; i < findWaitingEntreprise.employeesToValidate.length; i++){
                let emailToCompare = findWaitingEntreprise.employeesToValidate[i].email;
                if(emailToCompare === email) {
                    findWaitingEntreprise.employeesToValidate.splice(i, 1)
                }
            }
            findWaitingEntreprise.save();
        }

        // On retire les droits d'Admin et de Modo a l'utilisateur et on le transfère sur l'entreprise globale en attendant que sa nouvelle entreprise accepte sa demande.
        findUser.isValidate = false;
        findUser.isAdmin = false;
        findUser.isModo = false;
        findUser.idEntreprise = 18121995;
        findUser.waitingEntreprise = newEntrepriseId;
        findUser.save();

        return res.status(200).json({
            text: "Succès"
        });
    }
    catch(error) {
        return res.status(500).json({ error });
    }

}

exports.changeEntreprise = changeEntreprise;
