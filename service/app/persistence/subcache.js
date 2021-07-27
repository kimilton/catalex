
const cloneDeep = require('lodash/cloneDeep')
const freezeDeep = require('deep-freeze-node');

const { generateCachePartialFromList, cloneAndCertify, toSafeId } = require('../model')

const CONSTANTS = require('../const')

class SubCache {
    partialIdentifier
    updateCallbacks = []
    constructor(cacheData={}){
        this._cache = cacheData
    }
    read(){
        const cloned = cloneDeep(this._cache)
        return freezeDeep(cloned)
    }
    importCache(data){
        let subCache = {}
        if (data.hasOwnProperty(this.partialIdentifier)){
            subCache = cloneDeep(data[this.partialIdentifier])
        }
        this._cache = subCache
    }
    importRawList(){
        // no-op
    }
    addEntry(newEntry){
        const unsafeId = newEntry[CONSTANTS.ID_COLUMN_KEY]
        if (typeof unsafeId !== "string" || unsafeId.length < 3){
            throw new Error(CONSTANTS.ERROR_INVALID_ID)
        }
        const safeId = toSafeId(unsafeId)
        if (this.hasEntry(safeId)){
            throw new Error(CONSTANTS.ERROR_ENTRY_EXISTS)
        }
        const certifiedEntry = cloneAndCertify(newEntry)
        this._cache[safeId] = certifiedEntry
        this.updateCallbacks.forEach(cb => {
            cb(this.partialIdentifier, CONSTANTS.OPS_ADD, id, newEntry)
        })
        console.log(`[${this.partialIdentifier}] Cache entry created for ${safeId}. Object to follow:`)
        console.log(certifiedEntry)
        return certifiedEntry
    }
    hasEntry(entryId){
        return typeof this._cache[entryId] !== "undefined"
    }
    updateEntry(entryId, updatedFields){
        // Assume id supplied by the client is legit
        if (!this.hasEntry(entryId)){
            throw new Error(CONSTANTS.ERROR_NO_ENTRY_EXISTS)
        }
        throw new Error(CONSTANTS.ERROR_UNIMPLEMENTED)
    }
    deleteEntry(){
        // no-op
        throw new Error(CONSTANTS.ERROR_UNIMPLEMENTED)
    }
}

class WorksCache extends SubCache {
    partialIdentifier = CONSTANTS.WORKS
    constructor(data){
        super(data)
    }
    importRawList(rawList){
        const cachePartial = generateCachePartialFromList(rawList)
        for (let key of Object.keys(cachePartial)){
            if (!this.hasEntry(key)){
                this._cache[key] = cloneAndCertify(cachePartial[key])
            }
        }
    }
}

class PerformersCache extends SubCache {
    partialIdentifier = CONSTANTS.PERFORMERS
}

class AttributesCache extends SubCache {
    partialIdentifier = CONSTANTS.ATTRIBUTES
}

module.exports = {
    WorksCache,
    PerformersCache,
    AttributesCache,
}
