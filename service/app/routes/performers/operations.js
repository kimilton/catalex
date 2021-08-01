const CONSTANTS = require('../../const')
const { getPerformerInsertionObject, getPerformerUpdateObject } = require('../../model')
const { hasEntry, updateEntry } = require('../../persistence')
const { jsonWrap, jsonWrapErr } = require('../../protocol')

const addNewPerformer = (req, res) => {
    // Id validator logic should be straightforward
    const idValidator = id => hasEntry(CONSTANTS.PERFORMERS, id)
    // Inserting a new object means sanitizing input and attaching some metadata
    const performerInsertionObject = getPerformerInsertionObject(req.body, idValidator)
    // Cache saves the object and returns a copy that has been certified by the cache
    const savedObject = performersCache.addEntry(performerInsertionObject)
    res.json(jsonWrap(savedObject))
}

const updatePerformer = (req, res) => {
    // Grab the id from the request
    let entryId = req.params["performerId"]
    // Sanitize input and create and update object
    const performerUpdateObject = getPerformerUpdateObject(req.body)
    // Cache applies the update and returns a copy of the merged object
    const mergedObject = updateEntry(CONSTANTS.PERFORMERS, entryId, performerUpdateObject)
    res.json(jsonWrap(mergedObject))
}

module.exports = {
    addNewPerformer,
    updatePerformer
}
