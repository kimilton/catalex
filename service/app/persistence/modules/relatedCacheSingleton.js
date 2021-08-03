
const freezeDeep = require('deep-freeze-node');

const { SubCache } = require('./subcache')
const { Relation } = require('./relation')
const { filterOnlyRelationKeyValues } = require('../../model')
const CONSTANTS = require('../../const')

/*
    Taking over the duties of and providing a more stable API in place of primeCache,
    RelatedCache acts as a mapping layer that sits atop subcaches and relations.
*/
class RelatedCacheSingleton {
    subCaches = {}
    relations = {}
    relationAllInstances = []
    constructor(subCacheClassList, relationClassList){
        for (let subCacheClass of subCacheClassList){
            const instance = new subCacheClass()
            if (!(instance instanceof SubCache)) throw new Error(CONSTANTS.ERROR_INVALID_CLASS_INSTANCE)
            const subCacheName = instance.partialIdentifier
            this.subCaches[subCacheName] = instance
        }
        for (let relationClass of relationClassList){
            const instance = new relationClass()
            if (!(instance instanceof Relation)) throw new Error(CONSTANTS.ERROR_INVALID_CLASS_INSTANCE)
            instance.init() // Nasty. Remember that relation instances need to be initialized
            const primary = instance.primaryIdentifier
            const secondary = instance.secondaryIdentifier
            const accessField = instance.getAccessField()
            if (!Array.isArray(this.relations[primary])) this.relations[primary] = []
            if (!Array.isArray(this.relations[secondary])) this.relations[secondary] = []
            this.relations[primary].push(instance)
            this.relations[secondary].push(instance)
            this.relations[accessField] = instance
            // There isn't a clean way to iterate over all relation instances once. This helps
            this.relationAllInstances.push(instance)
        }
    }
    coldRead(subCachePartial, id, bypassIndexInjection){
        if (!subCachePartial || !id) throw new Error(CONSTANTS.ERROR_MISSING_INFO)
        const subCache = this._validateAndGetSubCache(subCachePartial)
        let content = subCache.read()
        if (id && this.hasEntry(subCachePartial, id)){
            // Get single entry flow. Grab content, index and fuse
            content = content[id]
            if (!bypassIndexInjection){
                const relationPartials = this.relations[subCachePartial]
                relationPartials.forEach(instance => {
                    const relationField = instance.read(subCachePartial, id, true) // Return with field wrapper
                    content = {...content, ...relationField} // mutate content object
                })
            }
        } else if (!bypassIndexInjection) {
            // Get all entries flow. Grab indices and fuse
            Object.keys(content).forEach(contentId => {
                const relationPartials = this.relations[subCachePartial]
                relationPartials.forEach(instance => {
                    const relationField = instance.read(subCachePartial, contentId, true) // Return with field wrapper
                    content[contentId] = {...content[contentId], ...relationField} // mutate content object
                })
            })
        }
        // Freeze before returning. This is meant to spell out expectations
        return freezeDeep(content)
    }
    list(subCachePartial){
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
            if (!(instance instanceof Relation)) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
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
        const relationKeyValuePairs = filterOnlyRelationKeyValues(updatedEntry)
        let insertedEntry = subCache.updateEntry(id, updatedEntry)
        for (let [accField, values] of Object.entries(relationKeyValuePairs)){
            const instance = this.relations[accField]
            if (!(instance instanceof Relation)) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
            instance.setRelations(subCachePartial, id, values)
        }
        return {...insertedEntry, ...relationKeyValuePairs}
    }
    _validateAndGetSubCache(subCachePartial){
        const subCache = this.subCaches[subCachePartial]
        if (!(subCache instanceof SubCache)) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
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
        const relationInstances = this.relationAllInstances
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
