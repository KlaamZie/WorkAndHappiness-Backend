const date = require('date-and-time');

const Entreprise = require("../../schema/schemaEntreprise.js");
const User = require("../../schema/schemaUser.js");
const updateEntrepriseHealthData = require("./updateEntrepriseHealthData");
const updateUserHealthData = require("./updateUserHealthData")


async function sendMail(email, firstname) {
	let request = require("request");

	let sendMail = {
		method: 'POST',
		url: 'https://api.sendinblue.com/v3/smtp/email',
		headers: {
			'content-type': 'application/json',
			'api-key': process.env.MAIL_API
		},
		body: `{"sender":{"name":"Work And Happiness","email":"noreply@workandhappiness.fr"},"to":[{"email":"${email}"}],"replyTo":{"email":"noreply@workandhappiness.fr"},"templateId":7, "params":{"firstname":"${firstname}"}}`
	};

	await request(sendMail, function(error, response, body) {
		if (error) {
			return this.setState({ error: "Une erreur est survenu sur le serveur. Nous vous prions de nous excuser." })
		}
	});
}

async function changeWeek(req, res) {
	await Entreprise.find(function(err, entreprise) {
		// On boucle sur toutes les entreprises
		for (let i = 0; i < entreprise.length; i++) {
			// Si c'est la première semaine de l'entreprise
			if(entreprise[i].firstWeek){
				let createdAt = new Date(entreprise[i].created_at);
				let numberOfDays = Math.floor(date.subtract(new Date(), createdAt).toDays());
				if(numberOfDays >= 6){
					if(entreprise[i].monthlyData.divider !== 0){
						updateUserHealthData.updateHealthData(entreprise[i]);
						updateEntrepriseHealthData.updateHealthData(entreprise[i]);
					}
					entreprise[i].firstWeek = false;
				}
				entreprise[i].save();
				continue;
			}
			// Sinon on update juste le actualWeek sauf en semaine 4 où on met à jour les données
			switch (entreprise[i].actualWeek) {
				case 1:
				entreprise[i].actualWeek = 2;
				entreprise[i].save();
				break;
				case 2:
				entreprise[i].actualWeek = 3;
				entreprise[i].save();
				break;
				case 3:
				entreprise[i].actualWeek = 4;
				entreprise[i].save();
				break;
				case 4:
				entreprise[i].actualWeek = 1;
				if(entreprise[i].monthlyData.divider !== 0){
					updateEntrepriseHealthData.updateHealthData(entreprise[i]);
					updateUserHealthData.updateHealthData(entreprise[i]);
				}
				entreprise[i].save();
				break;
				default:
				console.log("default");
			}
		}
	})
	await User.find(function(err, user) {
		for (let i = 0; i < user.length; i++) {
			switch (user[i].answerThisWeek) {
				case true:
				user[i].answerThisWeek = false;
				user[i].save();
				break;
				case false:
				break;
				default:
				console.log("default");
			}
			if (user[i].weeklyMail) {
				sendMail(user[i].email, user[i].firstname);
			}
		}
	})
	res.json('Ok week change');
}

exports.changeWeek = changeWeek;
