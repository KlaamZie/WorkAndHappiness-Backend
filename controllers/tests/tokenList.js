const tokenList = require("../../config/tokenList");

async function getTokenList(req, res) {

    return res.status(200).json({
        tokenList
    });

}

exports.getTokenList = getTokenList;
