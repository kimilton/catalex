const {
    getDefaultModel: getDefaultAttributes
} = require('./attributes')

const {
    getDefaultModel: getDefaultPerformers,
    getInsertionObject: getPerformerInsertionObject,
    getUpdateObject: getPerformerUpdateObject
} = require('./performers')

const {
    getDefaultModel: getDefaultWorks,
    getUpdateObject: getWorksUpdateObject,
    generateRawObject,
    generateCachePartialFromList
} = require('./works')

const { cloneAndCertify, filterOnlyRelationKeyValues, toSafeId, toUnsafeId, numToFixed } = require('./shared')

module.exports = {
    getDefaultAttributes,

    getDefaultPerformers,
    getPerformerInsertionObject,
    getPerformerUpdateObject,

    getDefaultWorks,
    getWorksUpdateObject,
    generateRawObject,
    generateCachePartialFromList,

    cloneAndCertify,
    filterOnlyRelationKeyValues,
    toSafeId,
    toUnsafeId,
    numToFixed
}
