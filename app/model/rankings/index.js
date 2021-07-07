const SHARED = require('../shared')

const DEFUALT_MODEL = {
    rank: SHARED.UNRANKED,
    target: SHARED.UNKNOWN,
    attribute: SHARED.UNKNOWN,
    timestamp: 0,
}

const getDefaultModel = () => DEFUALT_MODEL

exports.getDefaultModel = getDefaultModel
