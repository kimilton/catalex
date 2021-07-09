const CONSTANTS = require('../../const')

const getDefaultModel = () => ({
    id: "",
    rank: CONSTANTS.UNRANKED,
    target: CONSTANTS.UNKNOWN,
    attribute: CONSTANTS.UNKNOWN,
})

exports.getDefaultModel = getDefaultModel
