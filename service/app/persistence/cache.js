const cloneDeep = require('lodash/cloneDeep')
const freezeDeep = require('deep-freeze-node');

const { rawToWork, certifyEntry, toSafeId, getDefaultPerformers, getDefaultRankings, getDefaultWorks } = require('../model')
const { scanDirectory } = require('../filesystem')

let singletonCache = {}

const CONSTANTS = require('../const')

const SUBCACHE_LIST = [CONSTANTS.PERFORMERS, CONSTANTS.RANKINGS, CONSTANTS.WORKS]

const SUBCACHE_DEFAULT_GETTERS = {
    [CONSTANTS.PERFORMERS]: getDefaultPerformers,
    [CONSTANTS.RANKINGS]: getDefaultRankings,
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
        if (typeof newEntry.id !== "string" || newEntry.id.length < 3){
            throw new Error(CONSTANTS.ERROR_INVALID_ID)
        }
        const id = toSafeId(newEntry.id)
        if (typeof this._cache[id] !== "undefined"){
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
            const { id } = raw
            const safeId = toSafeId(id)
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

class RankingsCache extends SubCache {
    partialIdentifier = CONSTANTS.RANKINGS
}

const initializePrimeCache = async (loadedData = {}, performScan = false) => {
    let scanList
    if (performScan){
        scanList = await scanDirectory()
    }

    const primeCache = {
        [CONSTANTS.WORKS]: new WorksCache(),
        [CONSTANTS.PERFORMERS]: new PerformersCache(),
        [CONSTANTS.RANKINGS]: new RankingsCache(),
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
    RankingsCache,
    initializePrimeCache,
    convertPrimeCacheToRaw,
    getSubCache,
}
