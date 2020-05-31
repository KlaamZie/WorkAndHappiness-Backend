const User = require("../../schema/schemaUser.js");

async function sendMail(email, firstname) {
    let request = require("request");

    let sendMail = {
        method: 'POST',
        url: 'https://api.sendinblue.com/v3/smtp/email',
        headers: {
            'content-type': 'application/json',
            'api-key': process.env.MAIL_API
        },
        body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":6, "params":{"firstname":"${firstname}"}}`
    };

    await request(sendMail, function (error, response, body) {
        if (error) {
            return;
        }
    });
}

async function updateUserHealthData(entreprise) {
    await User.find({idEntreprise: entreprise._id}, function (err, users) {
        for (let i = 0; i < users.length; i++) {
            if (users[i].monthlyData.divider !== 0) {
                // On update healthData pour stocker les données du mois ou faire le premier bilan
                users[i].healthData.general = (users[i].monthlyData.general / users[i].monthlyData.divider).toFixed(1);

                if (users[i].monthlyData.dividerGroup1 !== 0) {
                    users[i].healthData.group1 = (users[i].monthlyData.group1 / users[i].monthlyData.dividerGroup1).toFixed(1);
                } else {
                    users[i].healthData.group1 = 0;
                }

                if (users[i].monthlyData.dividerGroup2 !== 0) {
                    users[i].healthData.group2 = (users[i].monthlyData.group2 / users[i].monthlyData.dividerGroup2).toFixed(1);
                } else {
                    entreprise.healthData.group2 = 0;
                }

                if (users[i].monthlyData.dividerGroup3 !== 0) {
                    users[i].healthData.group3 = (users[i].monthlyData.group3 / users[i].monthlyData.dividerGroup3).toFixed(1);
                } else {
                    users[i].healthData.group3 = 0;
                }

                // On clear le monthly data pour pouvoir accueillir les données du mois suivant
                users[i].monthlyData.divider = 0;
                users[i].monthlyData.dividerGroup1 = 0;
                users[i].monthlyData.dividerGroup2 = 0;
                users[i].monthlyData.dividerGroup3 = 0;
                users[i].monthlyData.general = 0;
                users[i].monthlyData.group1 = 0;
                users[i].monthlyData.group2 = 0;
                users[i].monthlyData.group3 = 0;

                // On archive la première valeur du tableau (la plus ancienne) si le tableau contient déjà 12 valeurs
                if (users[i].chart.month.length === 12) {

                    let months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                    let date = new Date()
                    let fullDate = months[date.getMonth()] + " " + date.getFullYear()

                    let general = users[i].chart.general[0]
                    let group1 = users[i].chart.group1[0]
                    let group2 = users[i].chart.group2[0]
                    let group3 = users[i].chart.group3[0]

                    const data = {
                        fullDate,
                        general,
                        group1,
                        group2,
                        group3
                    };

                    users[i].archives.push(data);

                    users[i].chart.month.splice(0, 1)
                    users[i].chart.general.splice(0, 1)
                    users[i].chart.group1.splice(0, 1)
                    users[i].chart.group2.splice(0, 1)
                    users[i].chart.group3.splice(0, 1)
                }

                // On push les données dans des tableaux pour pouvoir créer les graphs
                let months = ['Janv', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sept', 'Oct', 'Nov', 'Déc'];
                let month = new Date()
                users[i].chart.month.push(months[month.getMonth()]);
                users[i].chart.general.push(users[i].healthData.general);
                users[i].chart.group1.push(users[i].healthData.group1);
                users[i].chart.group2.push(users[i].healthData.group2);
                users[i].chart.group3.push(users[i].healthData.group3);
            }

            if (users[i].monthlyMail) {
                sendMail(users[i].email, users[i].firstname);
            }

            users[i].save();
        }
    })
}

exports.updateHealthData = updateUserHealthData;
