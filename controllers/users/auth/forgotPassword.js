const User = require("../../../schema/schemaUser.js");
const passwordHash = require("password-hash");

async function mailCode(email, name, code) {

    let request = require("request");

    let emailCode = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":3, "params":{"firstname":"${name}", "code":"${code}"}}`
    };

    await request(emailCode, function (error, response, body) {
        if (error) {
            return this.setState({error: "Une erreur est survenu sur le serveur. Nous vous prions de nous excuser."});
        }
    });
}

async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            text: "Requête invalide"
        });
    }

    try {
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(401).json({
                text: "L'adresse mail n'existe pas."
            });
        }

        let random = Math.floor(Math.random() * Math.floor(999999));

        findUser.forgotPassword = random;
        findUser.save();

        await mailCode(email, findUser.firstname, random);

        return res.status(200).json({
            text: "Mot de passe oublié validé !"
        });

    }
    catch (error) {
        return res.status(500).json({ error });
    }
}

exports.forgotPassword = forgotPassword;


async function checkCodeResetPassword(req, res) {
    const { email, code } = req.body;
    if (!email || !code) {
        //Le cas où l'ancien ou le nouveau mot de passe ne serait pas soumit ou nul
        return res.status(400).json({
            text: "Requête invalide"
        });
    }

    try {
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(401).json({
                text: "L'adresse mail n'existe pas."
            });
        }

        if (findUser.forgotPassword !== code) {
            return res.status(401).json({
                text: "Le code n'est pas le bon."
            });
        }

        return res.status(200).json({
            validCode: true,
            text: "Code validé !"
        });

    }
    catch (error) {
        return res.status(500).json({ error });
    }
}

exports.checkCodeResetPassword = checkCodeResetPassword;

async function resetPassword(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        //Le cas où l'ancien ou le nouveau mot de passe ne serait pas soumit ou nul
        return res.status(400).json({
            text: "Requête invalide"
        });
    }

    try {
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(401).json({
                text: "L'adresse mail n'existe pas."
            });
        }

        let newPasswordHashed = passwordHash.generate(password)

        findUser.password = newPasswordHashed;
        findUser.forgotPassword = 0;
        findUser.save();

        return res.status(200).json({
            text: "Le mot de passe à bien été réinitialiser !"
        });

    }
    catch (error) {
        return res.status(500).json({ error });
    }
}

exports.resetPassword = resetPassword;
