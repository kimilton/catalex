const CONSTANTS = require('../../const')

const DEFUALT_MODEL = {
    rank: CONSTANTS.UNRANKED,
    target: CONSTANTS.UNKNOWN,
    attribute: CONSTANTS.UNKNOWN,
    timestamp: 0,
}

const getDefaultModel = () => DEFUALT_MODEL

exports.getDefaultModel = getDefaultModel
