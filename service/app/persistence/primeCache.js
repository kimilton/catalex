const { scanDirectory } = require('../filesystem')
const { SubCache, WorksCache, PerformersCache, AttributesCache } = require('./subcache')
const { PerfsToWorksRelation } = require('./relation')

let singletonCache = {}

const CONSTANTS = require('../const')

const SUBCACHE_LIST = [
    {
        "key": CONSTANTS.PERFORMERS,
        "instantiator": () => new PerformersCache()
    },
    {
        "key": CONSTANTS.ATTRIBUTES,
        "instantiator": () => new AttributesCache()
    },
    {
        "key": CONSTANTS.WORKS,
        "instantiator": () => new WorksCache()
    }
]

const RELATIONS_LIST = [
    {
        "instantiator": () => new PerfsToWorksRelation()
    },
]

const initializePrimeCache = async (loadedData = {}, performScan = false) => {
    let scanList
    if (performScan){
        scanList = await scanDirectory()
    }

    // Branding the prime cache
    let primeCache = {
        [CONSTANTS.PRIME_CACHE_IDENTIFIER]: true
    }
    Object.defineProperty(
        primeCache,
        CONSTANTS.PRIME_CACHE_IDENTIFIER,
        { configurable: false, writable: false, enumerable: false }
    )

    // Instantiate the list of subcaches and attach them to the primeCache
    ;[...SUBCACHE_LIST].forEach(({ key, instantiator }) => {
        primeCache[key] = instantiator()
    })

    // Instantiate the list of relations, attach them, and register them to matching subcaches
    ;[...RELATIONS_LIST].forEach(({ instantiator }) => {
        const relation = instantiator()
        const key = relation.getKey()
        primeCache[key] = relation
        const primary = relation.primary
        const secondary = relation.secondary
        if (primeCache[primary] instanceof SubCache){
            primeCache[primary].registerRelation(relation, secondary)
        }
        if (primeCache[secondary] instanceof SubCache){
            primeCache[secondary].registerRelation(relation, primary)
        }
    })

    for (let subcache of Object.values(primeCache)){
        if (subcache.importCache && typeof subcache.importCache === 'function'){
            subcache.importCache(loadedData)
            if (scanList && subcache.importRawList && typeof subcache.importRawList === 'function'){
                subcache.importRawList(scanList)
            }
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
    const subCacheKeys = SUBCACHE_LIST.map(v => v.key)
    if (!subCacheKeys.includes(normalizedSubCacheId)){
        throw new Error(CONSTANTS.ERROR_INVALID_CACHE_TYPE)
    }
    return primeCache[normalizedSubCacheId]
}

module.exports = {
    initializePrimeCache,
    convertPrimeCacheToRaw,
    getSubCache,
}
