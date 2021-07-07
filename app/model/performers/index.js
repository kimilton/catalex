const SHARED = require('../shared')

const DEFUALT_MODEL = {
    name: "",
    otherNames: [],
    retired: SHARED.UNKNOWN,
    birthYear: 0,
    image: "",
    rankingTop: SHARED.UNRANKED,
    rankingBottom: SHARED.UNRANKED,
    rankingPerformance: SHARED.UNRANKED,
    rankingSubjective: SHARED.UNRANKED,
    tags: [],
}

const getDefaultModel = () => DEFUALT_MODEL

exports.getDefaultModel = getDefaultModel
