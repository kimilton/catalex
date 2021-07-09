const CONSTANTS = require('../../const')

const getDefaultModel = () => ({
    id: "",
    dirPath: "",
    fullFilePath: "",
    labelId: "",
    numbering: "",
    subIdentifier: CONSTANTS.NA,
    createdYear: 0,
    createdMonth: 0,
    downloadedTimestamp: 0,
    image: "",
    tags: [],
})

const rawToWork = raw => ({...getDefaultModel(), ...raw})

exports.getDefaultModel = getDefaultModel
exports.rawToWork = rawToWork
