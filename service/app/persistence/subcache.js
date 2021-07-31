
const cloneDeep = require('lodash/cloneDeep')

const { generateCachePartialFromList, cloneAndCertify, toSafeId } = require('../model')

const CONSTANTS = require('../const')

class SubCache {
    partialIdentifier
    updateCallbacks = []
    constructor(cacheDump = {}){
        this._cache = cacheDump
    }
    read(id){
        let source = this._cache
        if (id && this.hasEntry(id)){
            source = this._cache[id]
        }
        return cloneDeep(source)
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
    updateEntry(entryId, updatedEntry){
        // Assume id supplied by the client is legit
        if (!this.hasEntry(entryId)){
            throw new Error(CONSTANTS.ERROR_NO_ENTRY_EXISTS)
        }
        const certifiedEntry = cloneAndCertify(updatedEntry)
        const mergedEntry = {
            ...this._cache[entryId],
            ...certifiedEntry
        }
        this._cache[entryId] = mergedEntry
        this.updateCallbacks.forEach(cb => {
            cb(this.partialIdentifier, CONSTANTS.OPS_UPDATE, id, updatedEntry)
        })
        console.log(`[${this.partialIdentifier}] Cache entry updated for ${entryId}. Object to follow:`)
        console.log(mergedEntry)
        return mergedEntry
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
    SubCache,
    WorksCache,
    PerformersCache,
    AttributesCache,
}
