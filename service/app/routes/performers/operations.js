const CONSTANTS = require('../../const')
const { getPerformerInsertionObject, getPerformerUpdateObject } = require('../../model')
const { getSubCache } = require('../../persistence')
const { getDefaultIdValidator } = require('../shared')

const addNewPerformer = (req, res) => {
    // Get the relevant cache. This is used for unique key generation and for insertion later
    const performersCache = getSubCache(CONSTANTS.PERFORMERS)
    // Id validator logic should be universal. Use the shared one unless there are special requirements
    const idValidator = getDefaultIdValidator(performersCache)
    // Inserting a new object means sanitizing input and attaching some metadata
    const performerInsertionObject = getPerformerInsertionObject(req.body, idValidator)
    // Cache saves the object and returns a copy that has been certified by the cache
    const savedObject = performersCache.addEntry(performerInsertionObject)
    res.json(savedObject)
}

const updatePerformer = (req, res) => {
    // Grab the id from the request
    let entryId = req.params["performerId"]
    console.log('entryId', entryId)
    // Get the relevant cache
    const performersCache = getSubCache(CONSTANTS.PERFORMERS)
    // Sanitize input and create and update object
    const performerUpdateObject = getPerformerUpdateObject(req.body)
    console.log(req.body)
    console.log(performerUpdateObject)
    console.log('\n')
    // Cache applies the update and returns a copy of the merged object
    const mergedObject = performersCache.updateEntry(entryId, performerUpdateObject)
    res.json(mergedObject)
}

module.exports = {
    addNewPerformer,
    updatePerformer
}
