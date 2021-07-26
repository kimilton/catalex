const CONSTANTS = require('../../const')
const { constructDefaultModel } = require('../shared')

const MODEL_SCHEMA = {
    [CONSTANTS.ID_COLUMN_KEY]: {
        required: true,
        primaryKey: true,
    },
    [CONSTANTS.DIRPATH_COLUMN_KEY]: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    [CONSTANTS.FULLFILEPATH_COLUMN_KEY]: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    labelId: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    numbering: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_NUMBER,
    },
    subIdentifier: {
        required: false,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    createdYear: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_NUMBER,
    },
    createdMonth: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_NUMBER,
    },
    downloadedTimestamp: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_NUMBER,
    },
    image: {
        required: false,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
}

const getDefaultModel = () => constructDefaultModel(MODEL_SCHEMA)

const generateRawObject = (id, directory, fullPath) => ({
    [CONSTANTS.ID_COLUMN_KEY]: id,
    [CONSTANTS.DIRPATH_COLUMN_KEY]: directory,
    [CONSTANTS.FULLFILEPATH_COLUMN_KEY]: fullPath
})

const rawToWork = raw => ({...getDefaultModel(), ...raw})

exports.getDefaultModel = getDefaultModel
exports.generateRawObject = generateRawObject
exports.rawToWork = rawToWork
