const CONSTANTS = require('../../const')
const { constructDefaultModel } = require('../shared')

/*
Attributes describe dynamic, mutable values that can be attached to multiple other objects
Rankings, tags, view count, and various other data should be expressible through attributes
The value field may be used to contain nested objects with multiple fields
*/

const MODEL_SCHEMA = {
    [CONSTANTS.ID_COLUMN_KEY]: {
        required: true,
        primaryKey: true,
    },
    [CONSTANTS.CLASS_COLUMN_KEY]: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    [CONSTANTS.VALUE_COLUMN_KEY]: {
        required: false,
        enforceType: CONSTANTS.DATATYPE_ANY,
    }
}

const getDefaultModel = () => constructDefaultModel(MODEL_SCHEMA)

module.exports= {
    getDefaultModel,
} 
