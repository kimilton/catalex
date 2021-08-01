
const freezeDeep = require('deep-freeze-node');

const { SubCache } = require('./subcache')
const { Relation } = require('./relation')
const CONSTANTS = require('../../const')

/*
    Taking over the duties of and providing a more stable API in place of primeCache,
    RelatedCache acts as a mapping layer that sits atop subcaches and relations.
*/
class RelatedCacheSingleton {
    subCaches = {}
    relations = {}
    constructor(subCacheList, relationsList){
        for (let subCache of subCacheList){
            if (!subCache instanceof SubCache) throw new Error(CONSTANTS.ERROR_INVALID_CLASS_INSTANCE)
            const instance = new subCache()
            this.subCaches[subCache] = instance
        }
        for (let relation of relationsList){
            if (!relation instanceof Relation) throw new Error(CONSTANTS.ERROR_INVALID_CLASS_INSTANCE)
            const instance = new relation()
            const primary = instance.primaryIdentifier
            const secondary = instance.secondaryIdentifier
            const accessField = instance.getAccessField()
            if (!Array.isArray(this.relations[primary])) this.relations[primary] = []
            if (!Array.isArray(this.relations[secondary])) this.relations[secondary] = []
            this.relations[primary].push(instance)
            this.relations[secondary].push(instance)
            this.relations[accessField] = instance
        }
    }
    coldRead(subCachePartial, id, bypassIndexInjection){
        if (!subCachePartial || !id) throw new Error(CONSTANTS.ERROR_MISSING_INFO)
        const subCache = this._validateAndGetSubCache(subCachePartial)
        let content = subCache.read()
        if (id && this.hasEntry(id)){
            // Get single entry flow. Grab content, index and fuse
            content = content[id]
            if (!bypassIndexInjection){
                this.relations[id].forEach(relation => {
                    const relationField = relation.read(subCachePartial, id, true) // Return with field wrapper
                    content = {...content, ...relationField} // mutate content object
                })
            }
        } else if (!bypassIndexInjection) {
            // Get all entries flow. Grab indices and fuse
            Object.keys(content).forEach(contentId => {
                this.relations[contentId].forEach(relation => {
                    const relationField = relation.read(subCachePartial, contentId, true) // Return with field wrapper
                    content[contentId] = {...content[contentId], ...relationField} // mutate content object
                })
            })
        }
        // Freeze before returning. This is meant to spell out expectations
        return freezeDeep(content)
    }
    list(subCachePartial){
        if (!subCachePartial || !id) throw new Error(CONSTANTS.ERROR_MISSING_INFO)
        const subCache = this._validateAndGetSubCache(subCachePartial)
        return subCache.list()
    }
    importArchive(data){
        const storageList = this._getStorageInstancesList()
        storageList.forEach(storage => {
            storage.importArchive(data)
        })
    }
    addEntry(subCachePartial, id, newEntry){
        if (!subCachePartial || !id) throw new Error(CONSTANTS.ERROR_MISSING_INFO)
        const subCache = this._validateAndGetSubCache(subCachePartial)
        subCache.addEntry(newEntry) // Discard return object
        const relationalFields = Object.keys(newEntry).filter(key => key.startsWith(CONSTANTS.RELATION_KEY_PREFIX))
        relationalFields.forEach(accField => {
            const instance = this.relations[accField]
            if (!instance instanceof Relation) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
            instance.addRelations(subCachePartial, id, newEntry[accField])
        })
    }
    hasEntry(subCachePartial, id){
        if (!subCachePartial || !id) throw new Error(CONSTANTS.ERROR_MISSING_INFO)
        const subCache = this._validateAndGetSubCache(subCachePartial)
        return subCache.hasEntry(id)
    }
    updateEntry(subCachePartial, id, updatedEntry){
        if (!subCachePartial || !id) throw new Error(CONSTANTS.ERROR_MISSING_INFO)
        const subCache = this._validateAndGetSubCache(subCachePartial)
        subCache.updateEntry(updatedEntry) // Discard return object
        const relationalFields = Object.keys(updatedEntry).filter(key => key.startsWith(CONSTANTS.RELATION_KEY_PREFIX))
        relationalFields.forEach(accField => {
            const instance = this.relations[accField]
            if (!instance instanceof Relation) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
            instance.setRelations(subCachePartial, id, newEntry[accField])
        })
    }
    _validateAndGetSubCache(subCachePartial){
        const subCache = this.subCaches[subCachePartial]
        if (!subCache instanceof SubCache) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
        return subCache
    }
    dump(storageType){
        const storageList = this._getStorageInstancesList(storageType)
        return storageList.reduce((agg, next) => {
            return {...agg, ...next.dump()}
        }, {})
    }
    _getStorageInstancesList(storageType = CONSTANTS.ANY_STORAGE){
        const subCacheInstances = Object.values(this.subCaches)
        const relationInstances = Object.values(this.relations[this.primaryIdentifier])
        switch (storageType){
            case CONSTANTS.SUBCACHE:
                return subCacheInstances
            case CONSTANTS.RELATION:
                return relationInstances
            case CONSTANTS.ANY_STORAGE:
                return [...subCacheInstances, ...relationInstances]
            default:
                throw new Error(CONSTANTS.ERROR_UNKNOWN_STORAGE)
        }
    }
}

module.exports = {
    RelatedCacheSingleton
}