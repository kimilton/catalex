
const cloneDeep = require('lodash/cloneDeep')

const { generateCachePartialFromList, cloneAndCertify } = require('../../model')
const CONSTANTS = require('../../const')

class SubCache {
    partialIdentifier
    updateCallbacks = []
    constructor(cacheDump = {}){
        this._cache = cacheDump
    }
    read(id, wrap){
        let source = this._cache
        if (this.hasEntry(id)){
            source = this._cache[id]
        }
        let cloned = cloneDeep(source)
        if (wrap){
            cloned = {
                [this.partialIdentifier]: cloned
            }
        }
        return cloned
    }
    list(){
        return Object.keys(this._cache)
    }
    importArchive(data){
        let archived = {}
        if (data && data.hasOwnProperty(this.partialIdentifier)){
            archived = cloneDeep(data[this.partialIdentifier])
        }
        this._cache = archived
        const importedEntries = Object.keys(archived).length
        if (importedEntries > 0){
            console.log(`[${this.partialIdentifier}] SubCache archive import successful. ${importedEntries} relations imported.`)
        }
    }
    importRawList(){
        // no-op
    }
    addEntry(newEntry){
        const entryId = newEntry[CONSTANTS.ID_COLUMN_KEY]
        // turn this into a reusable id validator
        if (typeof entryId !== "string" || entryId.length < 3){
            throw new Error(CONSTANTS.ERROR_INVALID_ID)
        }
        if (this.hasEntry(entryId)){
            throw new Error(CONSTANTS.ERROR_ENTRY_EXISTS)
        }
        const certifiedEntry = cloneAndCertify(newEntry)
        this._cache[entryId] = certifiedEntry
        this.updateCallbacks.forEach(cb => {
            cb(this.partialIdentifier, CONSTANTS.OPS_ADD, id, newEntry)
        })
        console.log(`[${this.partialIdentifier}] Cache entry created for ${entryId}. Object to follow:`)
        console.log(certifiedEntry)
        return certifiedEntry
    }
    hasEntry(entryId){
        return typeof entryId === "string" && typeof this._cache[entryId] !== "undefined"
    }
    updateEntry(entryId, updatedEntry){
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
    dump(){
        return this.read(null, true)
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
