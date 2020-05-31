const Entreprise = require("../../../schema/schemaEntreprise.js");
const User = require("../../../schema/schemaUser.js");

const jwt = require('jsonwebtoken');
const config = require("../../../config/config");

async function waitingEntreprise(req, res) {

  let token = req.headers['x-access-token'] || req.headers['authorization'];
  token = token.substring(7, token.length);
  let userData = jwt.verify(token, config.secret);

  let user = await User.findById(userData.id)

  try {
    const findEntreprise = await Entreprise.findById(user.waitingEntreprise);

    return res.status(200).json({
      name: findEntreprise.name
    });

  }
  catch (error) {
    return res.status(500).json({ error });
  }

}

exports.waitingEntreprise = waitingEntreprise;
