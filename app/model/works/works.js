const SHARED = require('../shared')

const DEFUALT_MODEL = {
    name: "",
    filePath: "",
    identifier: "",
    production: "",
    identifier: "",
    subIdentifier: SHARED.NA,
    createdYear: 0,
    createdMonth: 0,
    image: "",
    ranking: SHARED.UNRANKED,
    tags: [],
}

const getDefaultModel = () => DEFUALT_MODEL

exports.getDefaultModel = getDefaultModel
