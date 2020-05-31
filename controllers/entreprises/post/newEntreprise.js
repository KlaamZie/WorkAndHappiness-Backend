const Entreprise = require("../../../schema/schemaEntreprise.js");

async function newEntreprise(req, res) {
    const {name} = req.body;
    if (!name) {
        //Le cas où le nom ne serait pas soumit ou nul
        return res.status(400).json({
            text: "Requête invalide"
        });
    }

    function generateId() {
        // Math random = chiffre à virgule entre 0 et 11 et
        // On multiplie par 999999 pour avoir les 6 premiers chiffre après la vvirgule
        // On rajoute 100001 pour être sûre d'avoir une suite de 6 chiffres
        // L'id est un chiffre entre 100001 et 999999
        return Math.floor(Math.random() * (999999 - 100001) + 100001);
    }

    // On génère l'id d'entreprise
    let _id = generateId();

    // On check en base si l'entreprise existe déjà
    try {
        const findEntreprisename = await Entreprise.findOne({
            name
        });
        if (findEntreprisename) {
            return res.status(400).json({
                text: "L'entreprise existe déjà"
            });
        }

        let findEntrepriseId = await Entreprise.findOne({_id});
        while (findEntrepriseId) {
            _id = generateId();
            findEntrepriseId = await Entreprise.findOne({_id});
        }
    } catch (error) {
        return res.status(500).json({error});
    }

    // Création d'un objet entreprise
    const entreprise = {
        _id,
        name
    };

    try {
        // Sauvegarde de l'entreprise en base
        const entrepriseData = new Entreprise(entreprise);
        await entrepriseData.save();
        const findEntrepriseId = await Entreprise.findById({_id});
        return res.status(200).json({
            _id: findEntrepriseId._id,
            name: findEntrepriseId.name,
            text: "Succès"
        });
    } catch (error) {
        return res.status(500).json({error});
    }
}

exports.newEntreprise = newEntreprise;

async function sendMail(email, idEntreprise, entrepriseName) {
    let request = require("request");

    let sendMail = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":11, "params":{"idEntreprise":"${idEntreprise}", "entrepriseName":"${entrepriseName}"}}`
    };

    await request(sendMail, function (error, response, body) {
        if (error) {
            return;
        }
    });
}

async function sendEntrepriseMail(req, res) {
    const {email, idEntreprise} = req.body;
    if (!email || !idEntreprise) {
        return res.status(400).json({
            text: "Requête invalide"
        });
    }
    try {
        Entreprise.findById(idEntreprise, function (err, entreprise) {
            if (!err) {
                sendMail(email, idEntreprise, entreprise.name)
                return res.status(200).json({
                    text: "Succès"
                });
            }
        })
    } catch (error) {
        return res.status(500).json({error});
    }
}

exports.sendEntrepriseMail = sendEntrepriseMail;
