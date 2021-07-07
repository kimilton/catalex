const SHARED = require('../shared')

const DEFUALT_MODEL = {
    id: "",
    dirPath: "",
    fullFilePath: "",
    labelId: "",
    numbering: "",
    subIdentifier: SHARED.NA,
    createdYear: 0,
    createdMonth: 0,
    downloadedTimestamp: Date.now(),
    image: "",
    ranking: SHARED.UNRANKED,
    tags: [],
}

const getDefaultModel = () => DEFUALT_MODEL

exports.getDefaultModel = getDefaultModel
