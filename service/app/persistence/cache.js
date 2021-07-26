const cloneDeep = require('lodash/cloneDeep')
const freezeDeep = require('deep-freeze-node');

const { rawToWork, certifyEntry, toSafeId, getDefaultPerformers, getDefaultAttributes, getDefaultWorks } = require('../model')
const { scanDirectory } = require('../filesystem')

let singletonCache = {}

const CONSTANTS = require('../const')

const SUBCACHE_LIST = [CONSTANTS.PERFORMERS, CONSTANTS.ATTRIBUTES, CONSTANTS.WORKS]

const SUBCACHE_DEFAULT_GETTERS = {
    [CONSTANTS.PERFORMERS]: getDefaultPerformers,
    [CONSTANTS.ATTRIBUTES]: getDefaultAttributes,
    [CONSTANTS.WORKS]: getDefaultWorks,
}

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
        const getDefaultModel = SUBCACHE_DEFAULT_GETTERS[this.partialIdentifier]
        const unsafeId = newEntry[CONSTANTS.ID_COLUMN_KEY]
        if (typeof unsafeId !== "string" || unsafeId.length < 3){
            throw new Error(CONSTANTS.ERROR_INVALID_ID)
        }
        const id = toSafeId(unsafeId)
        if (typeof this._cache[id] !== "undefined"){ // TODO: Implement .hasEntry()
            throw new Error(CONSTANTS.ERROR_ENTRY_EXISTS)
        }
        const entry = getDefaultModel()
        for (let attribute of Object.keys(entry)){
            if (newEntry.hasOwnProperty(attribute)){
                entry[attribute] = newEntry[attribute]
            }
        }
        this._cache[id] = certifyEntry(entry)
        this.updateCallbacks.forEach(cb => {
            cb(this.partialIdentifier, CONSTANTS.OPS_ADD, id, entry)
        })
    }
    updateEntry(){
        // no-op
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
        for (let raw of rawList){
            const unsafeId = raw[CONSTANTS.ID_COLUMN_KEY]
            const safeId = toSafeId(unsafeId)
            if (!this._cache.hasOwnProperty(safeId)){
                const work = rawToWork(raw)
                this._cache[safeId] = work
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

const initializePrimeCache = async (loadedData = {}, performScan = false) => {
    let scanList
    if (performScan){
        scanList = await scanDirectory()
    }

    const primeCache = {
        [CONSTANTS.WORKS]: new WorksCache(),
        [CONSTANTS.PERFORMERS]: new PerformersCache(),
        [CONSTANTS.ATTRIBUTES]: new AttributesCache(),
        [CONSTANTS.PRIME_CACHE_IDENTIFIER]: true,
    }

    Object.defineProperty(
        primeCache,
        CONSTANTS.PRIME_CACHE_IDENTIFIER,
        { configurable: false, writable: false, enumerable: false }
    )

    for (let subcache of Object.values(primeCache)){
        subcache.importCache(loadedData)
        if (scanList){
            subcache.importRawList(scanList)
        }
    }
    singletonCache = primeCache
    return singletonCache
}

const convertPrimeCacheToRaw = givenPrimeCache => {
    const primeCache = givenPrimeCache || singletonCache
    if (!primeCache[CONSTANTS.PRIME_CACHE_IDENTIFIER]){
        throw new Error(CONSTANTS.ERROR_INVALID_CACHE_TYPE)
    }
    let rawCache = {}
    for (let cacheId of Object.keys(primeCache)){
        rawCache[cacheId] = primeCache[cacheId].read()
    }
    return rawCache
}


const getSubCache = (subCacheId, givenPrimeCache) => {
    const primeCache = givenPrimeCache || singletonCache
    const normalizedSubCacheId = subCacheId.toUpperCase()
    if (!SUBCACHE_LIST.includes(normalizedSubCacheId)){
        throw new Error(CONSTANTS.ERROR_INVALID_CACHE_TYPE)
    }
    return primeCache[normalizedSubCacheId]
}

module.exports = {
    WorksCache,
    PerformersCache,
    AttributesCache,
    initializePrimeCache,
    convertPrimeCacheToRaw,
    getSubCache,
}
