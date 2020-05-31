const Entreprise = require("../../../schema/schemaEntreprise.js");
const User = require("../../../schema/schemaUser.js");

const jwt = require("jsonwebtoken");
const config = require("../../../config/config");

async function postData(req, res) {
	let token = req.headers['x-access-token'] || req.headers['authorization'];
	token = token.substring(7, token.length);
	let userData = jwt.verify(token, config.secret);

	let findUser = await User.findById(userData.id);
	let idEntreprise = findUser.idEntreprise;
	const { general, group1, group2, group3 } = req.body;
	if (!general) {
		//Le cas où l'id ou bien le formulaire ne serait pas soumit ou nul
		return res.status(400).json({
			text: "Requête invalide"
		});
	}

	Entreprise.findById(idEntreprise, function(err, entreprise) {
		if (!err) {
			if(!entreprise.firstWeek) {
				if (entreprise.actualWeek !== 4) {
					entreprise.monthlyData.divider = entreprise.monthlyData.divider + 1;
					entreprise.monthlyData.general = entreprise.monthlyData.general + general;
				}
				if (entreprise.actualWeek === 1) {
					entreprise.monthlyData.dividerGroup1 = entreprise.monthlyData.dividerGroup1 + 1;
					entreprise.monthlyData.dividerGroup3 = entreprise.monthlyData.dividerGroup3 + 1;
					entreprise.monthlyData.group1 = entreprise.monthlyData.group1 + group1;
					entreprise.monthlyData.group3 = entreprise.monthlyData.group3 + group2;
				}
				if (entreprise.actualWeek === 2) {
					entreprise.monthlyData.dividerGroup1 = entreprise.monthlyData.dividerGroup1 + 1;
					entreprise.monthlyData.dividerGroup2 = entreprise.monthlyData.dividerGroup2 + 1;
					entreprise.monthlyData.group1 = entreprise.monthlyData.group1 + group1;
					entreprise.monthlyData.group2 = entreprise.monthlyData.group2 + group2;
				}
				if (entreprise.actualWeek === 3) {
					entreprise.monthlyData.dividerGroup2 = entreprise.monthlyData.dividerGroup2 + 1;
					entreprise.monthlyData.dividerGroup3 = entreprise.monthlyData.dividerGroup3 + 1;
					entreprise.monthlyData.group2 = entreprise.monthlyData.group2 + group1;
					entreprise.monthlyData.group3 = entreprise.monthlyData.group3 + group2;
				}
				if (entreprise.actualWeek === 4) {
					entreprise.monthlyData.divider = entreprise.monthlyData.divider + 1;
					entreprise.monthlyData.general = entreprise.monthlyData.general + group1;
				}
			}
			else {
				entreprise.monthlyData.divider = entreprise.monthlyData.divider + 1;
				entreprise.monthlyData.general = entreprise.monthlyData.general + general;

				entreprise.monthlyData.dividerGroup1 = entreprise.monthlyData.dividerGroup1 + 1;
				entreprise.monthlyData.dividerGroup2 = entreprise.monthlyData.dividerGroup2 + 1;
				entreprise.monthlyData.dividerGroup3 = entreprise.monthlyData.dividerGroup3 + 1;

				entreprise.monthlyData.group1 = entreprise.monthlyData.group1 + group1;
				entreprise.monthlyData.group2 = entreprise.monthlyData.group2 + group2;
				entreprise.monthlyData.group3 = entreprise.monthlyData.group3 + group3;
			}

			entreprise.save();

			User.findById(userData.id, function(err, user) {
				if (!err) {
					if(!entreprise.firstWeek) {
						if (entreprise.actualWeek !== 4) {
							user.monthlyData.divider = user.monthlyData.divider + 1;
							user.monthlyData.general = user.monthlyData.general + general;
						}
						if (entreprise.actualWeek === 1) {
							user.monthlyData.dividerGroup1 = user.monthlyData.dividerGroup1 + 1;
							user.monthlyData.dividerGroup3 = user.monthlyData.dividerGroup3 + 1;
							user.monthlyData.group1 = user.monthlyData.group1 + group1;
							user.monthlyData.group3 = user.monthlyData.group3 + group2;
						}
						if (entreprise.actualWeek === 2) {
							user.monthlyData.dividerGroup1 = user.monthlyData.dividerGroup1 + 1;
							user.monthlyData.dividerGroup2 = user.monthlyData.dividerGroup2 + 1;
							user.monthlyData.group1 = user.monthlyData.group1 + group1;
							user.monthlyData.group2 = user.monthlyData.group2 + group2;
						}
						if (entreprise.actualWeek === 3) {
							user.monthlyData.dividerGroup2 = user.monthlyData.dividerGroup2 + 1;
							user.monthlyData.dividerGroup3 = user.monthlyData.dividerGroup3 + 1;
							user.monthlyData.group2 = user.monthlyData.group2 + group1;
							user.monthlyData.group3 = user.monthlyData.group3 + group2;
						}
						if (entreprise.actualWeek === 4) {
							user.monthlyData.divider = user.monthlyData.divider + 1;
							user.monthlyData.general = user.monthlyData.general + group1;
						}
					}
					else {
						user.monthlyData.divider = user.monthlyData.divider + 1;
						user.monthlyData.general = user.monthlyData.general + general;

						user.monthlyData.dividerGroup1 = user.monthlyData.dividerGroup1 + 1;
						user.monthlyData.dividerGroup2 = user.monthlyData.dividerGroup2 + 1;
						user.monthlyData.dividerGroup3 = user.monthlyData.dividerGroup3 + 1;

						user.monthlyData.group1 = user.monthlyData.group1 + group1;
						user.monthlyData.group2 = user.monthlyData.group2 + group2;
						user.monthlyData.group3 = user.monthlyData.group3 + group3;
					}

					user.answerThisWeek = true;
					user.save();
				}
			})
		}
	})
	return res.status(200).json({
		text: "Données postées"
	})
}

exports.postData = postData;
