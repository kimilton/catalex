const cloneDeep = require('lodash/cloneDeep')
const freezeDeep = require('deep-freeze-node');

const { rawToWork, toSafeId, getDefaultPerformers, getDefaultRankings, getDefaultWorks } = require('../model')
const { scanDirectory } = require('../filesystem')

const CONSTANTS = require('../const')

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
    getCache(){
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
        this._cache[id] = entry
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
    say(){
        console.log(this.partialIdentifier)
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

    for (subcache of Object.values(primeCache)){
        if (scanList && subCache.hasOwnProperty('importRawList')){
            subcache.importRawList(scanList)
        }
    }
    return primeCache
}

const convertPrimeCacheToRaw = primeCache => {
    if (!primeCache[CONSTANTS.PRIME_CACHE_IDENTIFIER]){
        throw new Error(CONSTANTS.ERROR_INVALID_CACHE_TYPE)
    }
    let rawCache = {}
    for (cacheId of Object.keys(primeCache)){
        rawCache[cacheId] = primeCache[cacheId].getCache()
    }
    return rawCache
}

module.exports = {
    WorksCache,
    PerformersCache,
    RankingsCache,
    initializePrimeCache,
    convertPrimeCacheToRaw,
}
