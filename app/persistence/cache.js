const cloneDeep = require('lodash/cloneDeep')
const freezeDeep = require('deep-freeze-node');

const { rawToWork, toSafeId } = require('../model/works/')
const { scanDirectory } = require('../filesystem')

const CONSTANTS = require('../const')


class SubCache {
    partialIdentifier
    constructor(cacheData={}){
        this._cache = cacheData
    }
    getCache(){
        const cloned = cloneDeep(this._cache)
        return freezeDeep(cloned)
    }
    importCache(data){
        let subCache = {}
        if (!this.partialIdentifier){
            throw new Error(`Cache error: No partial identifier registered`)
        }
        if (data.hasOwnProperty(this.partialIdentifier)){
            subCache = cloneDeep(data[this.partialIdentifier])
        }
        this._cache = subCache
    }
    importRawList(){
        // no-op
    }
}

class WorksCache extends SubCache {
    partialIdentifier = CONSTANTS.CACHE_ID_WORKS
    importRawList(rawList){
        for (let raw of rawList){
            const { id } = raw
            if (!this._cache.hasOwnProperty(id)){
                const work = rawToWork(raw)
                const safeId = toSafeId(id)
                this._cache[safeId] = work
            }
        }
    }
}

class PerformersCache extends SubCache {
    partialIdentifier = CONSTANTS.CACHE_ID_PERFORMERS
}

class RankingsCache extends SubCache {
    partialIdentifier = CONSTANTS.CACHE_ID_RANKINGS
}

const initializePrimeCache = async (loadedData = {}, performScan = false) => {
    let scanList
    if (performScan){
        scanList = await scanDirectory()
    }

    const primeCache = {
        [CONSTANTS.CACHE_ID_WORKS]: new WorksCache(),
        [CONSTANTS.CACHE_ID_PERFORMERS]: new PerformersCache(),
        [CONSTANTS.CACHE_ID_RANKINGS]: new RankingsCache(),
    }

    for (subcache of Object.values(primeCache)){
        subcache.importCache(loadedData)
        if (scanList){
            subcache.importRawList(scanList)
        }
    }
    return primeCache
}

const convertPrimeCacheToRaw = primeCache => {
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
