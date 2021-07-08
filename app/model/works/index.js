const CONSTANTS = require('../../const')

const UNSAFE_ID_SEPARATOR = '-'
const SAFE_ID_SEPARATOR = '_'

const DEFUALT_MODEL = {
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
    ranking: CONSTANTS.UNRANKED,
    tags: [],
}

const getDefaultModel = () => DEFUALT_MODEL

const toSafeId = unsafe => unsafe.split(UNSAFE_ID_SEPARATOR).join(SAFE_ID_SEPARATOR)
const toUnsafeId = safe => safe.split(SAFE_ID_SEPARATOR).join(UNSAFE_ID_SEPARATOR)
const rawToWork = raw => ({...DEFUALT_MODEL, ...raw})

exports.getDefaultModel = getDefaultModel
exports.toSafeId = toSafeId
exports.toUnsafeId = toUnsafeId
exports.rawToWork = rawToWork
