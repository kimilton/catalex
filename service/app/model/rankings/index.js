const CONSTANTS = require('../../const')

const getDefaultModel = () => ({
    id: "",
    rank: CONSTANTS.UNRANKED,
    target: "",
    attribute: "",
})

exports.getDefaultModel = getDefaultModel
