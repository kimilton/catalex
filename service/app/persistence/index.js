const { scanDirectory } = require('../filesystem')
const { SubCache, WorksCache, PerformersCache, AttributesCache } = require('./modules/subcache')
const { PerfsToWorksRelation } = require('./modules/relation')
const { RelatedCacheSingleton } = require('./modules/relatedCacheSingleton')

const CONSTANTS = require('../const')


// Register all subCaches here
const SUBCACHE_LIST = [PerformersCache, AttributesCache, WorksCache]
// Register all relations here
const RELATIONS_LIST = [PerfsToWorksRelation]

let _singletonCache

const initializePersistence = (archivedData = {})  => {
    // Instantiate the RelCacheSingleton here once. All exported methods here should operate on this instance
    _singletonCache = new RelatedCacheSingleton(SUBCACHE_LIST, RELATIONS_LIST)
    console.log(`[Persistence] All cache and relation records initialized\n`)

    // Import existing records into their respective storage, if any
    if (archivedData){
        _singletonCache.importArchive(archivedData)
    }
}

const list = (subCacheId) => _singletonCache.list(subCacheId)

const readEntry = (subCacheId, entryId) => _singletonCache.coldRead(subCacheId, entryId)

const addEntry = (subCacheId, entryId, entryData) => _singletonCache.addEntry(subCacheId, entryId, entryData)

const updateEntry = (subCacheId, entryId, entryData) => _singletonCache.updateEntry(subCacheId, entryId, entryData)

const hasEntry = (subCacheId, entryId) => _singletonCache.hasEntry(subCacheId, entryId)

const getPersistanceStateDump = () => _singletonCache.dump()


module.exports = {
    initializePersistence,
    list,
    readEntry,
    addEntry,
    updateEntry,
    hasEntry,
    getPersistanceStateDump,
}
