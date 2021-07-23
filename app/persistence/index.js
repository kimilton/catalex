const { WorksCache, PerformersCache, RankingsCache, initializePrimeCache, convertPrimeCacheToRaw } = require('./cache')

const singletonCache = {}

module.exports = {
    WorksCache,
    PerformersCache,
    RankingsCache,
    singletonCache,
    initializePrimeCache,
    convertPrimeCacheToRaw,
}

