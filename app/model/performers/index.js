const CONSTANTS = require('../../const')

const DEFUALT_MODEL = {
    name: "",
    otherNames: [],
    retired: CONSTANTS.UNKNOWN,
    birthYear: 0,
    image: "",
    rankingTop: CONSTANTS.UNRANKED,
    rankingBottom: CONSTANTS.UNRANKED,
    rankingPerformance: CONSTANTS.UNRANKED,
    rankingSubjective: CONSTANTS.UNRANKED,
    tags: [],
}

const getDefaultModel = () => DEFUALT_MODEL

exports.getDefaultModel = getDefaultModel
