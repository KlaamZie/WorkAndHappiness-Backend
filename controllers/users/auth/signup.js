const User = require("../../../schema/schemaUser.js");
const Entreprise = require("../../../schema/schemaEntreprise.js");
const passwordHash = require("password-hash");

const tokenList = require("../../../config/tokenList");

async function confirmSignup(email, firstname) {
    let request = require("request");

    let confirmSignup = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":1, "params":{"firstname":"${firstname}"}}`
    };

    await request(confirmSignup, function (error, response, body) {
        if (error) {
            return;
        }
    });
}

async function confirmEmail(email, firstname) {
    let request = require("request");

    let confirmSignup = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":2, "params":{"firstname":"${firstname}"}}`
    };

    await request(confirmSignup, function (error, response, body) {
        if (error) {
            return;
        }
    });
}

async function signup(req, res) {
    const {firstname, lastname, idEntreprise, email, password, weeklyMail, monthlyMail, cgu} = req.body;
    if (!firstname || !lastname || !idEntreprise || !email || !password) {
        //Le cas où l'email ou bien le password ne serait pas soumit ou nul
        return res.status(400).json({
            text: "Requête invalide"
        });
    }

    let isAdmin = false;
    let isModo = false;
    let isValidate = false;

    // On check en base si l'utilisateur existe déjà
    try {
        const findUser = await User.findOne({email});
        if (findUser) {
            return res.status(401).json({
                text: "L'adresse mail est déjà utilisée."
            });
        }
        const findEntreprise = await Entreprise.findById(idEntreprise);
        if (!findEntreprise) {
            return res.status(401).json({
                text: "L'entreprise n'existe pas."
            });
        }
        if (!findEntreprise.employeesToValidate.length && !findEntreprise.validatedEmployees.length) {
            isAdmin = true;
            isModo = true;
            isValidate = true;
        }
    } catch (error) {
        return res.status(500).json({error});
    }

    // Création d'un objet user, dans lequel on hash le mot de passe
    let user = {
        isAdmin,
        isModo,
        isValidate,
        waitingEntreprise: idEntreprise,
        firstname,
        lastname,
        idEntreprise: 18121995,
        email,
        password: passwordHash.generate(password),
        weeklyMail,
        monthlyMail,
        cgu
    };

    if (isAdmin && isModo && isValidate) {
        user = {
            isAdmin,
            isModo,
            isValidate,
            firstname,
            lastname,
            idEntreprise,
            email,
            password: passwordHash.generate(password),
            weeklyMail,
            monthlyMail,
            cgu
        }
    }

    try {
        // Sauvegarde de l'utilisateur en base
        const userData = new User(user);
        await userData.save();
        const findUser = await User.findOne({email});
        if (isAdmin && isValidate) {
            const findEntreprise = await Entreprise.findById(idEntreprise);
            let uid = findUser._id;
            const addValidatedUser = {
                uid,
                email,
                firstname,
                lastname,
                isAdmin,
                isModo
            };

            let addValidated = findEntreprise.validatedEmployees.slice();
            addValidated.push(addValidatedUser);
            findEntreprise.validatedEmployees = addValidated;
            findEntreprise.save();
        }

        if (!isAdmin && !isValidate) {
            const findEntreprise = await Entreprise.findById(idEntreprise);
            const addUserToValidate = {
                email,
                firstname,
                lastname
            };

            let addToValidate = findEntreprise.employeesToValidate.slice();
            addToValidate.push(addUserToValidate);
            findEntreprise.employeesToValidate = addToValidate;
            findEntreprise.save();
        }

        confirmSignup(email, firstname);
        confirmEmail(email, firstname);

        let userToken = findUser.getUserToken();
        let refreshToken = findUser.getRefreshToken();

        const response = {
            "status": "Logged in",
            "token": userToken,
            "refreshToken": refreshToken,
        }

        tokenList[findUser._id] = response;

        return res.status(200).json({
            token: userToken,
            refreshToken,
            text: "Succès"
        });
    } catch (error) {
        return res.status(500).json({error});
    }
}

exports.signup = signup;
