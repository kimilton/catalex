const CONSTANTS = require('../../const')

const getDefaultModel = () => ({
    id: "",
    name: "",
    otherNames: [],
    retired: CONSTANTS.UNKNOWN,
    birthYear: 0,
    image: "",
    tags: [],
})

exports.getDefaultModel = getDefaultModel
