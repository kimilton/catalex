
const cloneDeep = require('lodash/cloneDeep')

const { toSafeId } = require('../../model')
const CONSTANTS = require('../../const')

class Relation {
    primaryIdentifier
    secondaryIdentifier
    primaryMultiple
    secondaryMultiple
    maintainSecondaryIndex = false
    accessFieldSuffix
    
    constructor(){
        const REQ_FIELDS = [
            this.primaryIdentifier,
            this.secondaryIdentifier,
            this.primaryMultiple,
            this.secondaryMultiple,
            this.accessFieldSuffix
        ]
        if (REQ_FIELDS.some(v => typeof v === "undefined")) throw new Error(CONSTANTS.ERROR_UNIMPLEMENTED)
        this[this.primaryIdentifier] = {}
        this[this.secondaryIdentifier] = {}
    }
    read(partialId, id, wrap){
        let partialIndex = this[partialId]
        if (!partialIndex) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
        content = partialIndex
        if (id && partialIndex[id]){
            content = partialIndex[id]
        }
        const accessField = this.getAccessField()
        let cloned = cloneDeep(content)
        if (wrap){
            cloned = {
                [accessField]: cloned
            }
        }
        return cloned
    }
    importArchive(data){
        /*
        Expected format:
        {
            [this.accessField]: this[this.primaryIdentifier]
        }
        this.dump() should produce the matching format for exports
        */
        const accessField = this.getAccessField()
        let archived = {}
        if (data && data.hasOwnProperty(accessField)){
            archived = cloneDeep(data[accessField])
        }
        this[this.primaryIdentifier] = archived
        const importedRelations = Object.keys(archived).length
        if (importedRelations > 0){
            console.log(`[${this.getAccessField()}] Relation archive import successful. ${importedRelations} relations imported.`)
            if (this.maintainSecondaryIndex){
                // Build the secondary index here and now
                this._buildMirroredIndex()
            }
        }
    }
    _buildMirroredIndex(buildPrimaryFromSecondary){
        const sourceId  = buildPrimaryFromSecondary ? this.secondaryIdentifier : this.primaryIdentifier
        const source = this[sourceId]
        const sourceMultiple = buildPrimaryFromSecondary ? this.secondaryMultiple : this.primaryMultiple
        const targetId = buildPrimaryFromSecondary ? this.primaryIdentifier : this.secondaryIdentifier
        const targetMultiple = buildPrimaryFromSecondary ? this.primaryMultiple : this.secondaryMultiple
        Object.keys(source).forEach(sourceKey => {
            if (sourceMultiple) {
                // Source (primary) can hold multiple matching values
                const targetValues = [...source[sourceKey]]
                targetValues.forEach(targetValue => {
                    this._addRelation(targetId, targetMultiple, targetValue, sourceKey)
                })
            } else {
                // Source (primary) can match a single value
                const targetValue = source[sourceKey]
                this._addRelation(targetId, targetMultiple, targetValue, sourceKey)
            }
        })
        console.log(`[${this.getAccessField()}] ${buildPrimaryFromSecondary ? 'Primary' : 'Secondary'} relation index built`)
    }
    // This method sets values 1:1. For 1:x, use setRelations()
    addRelations(partialId, dataId, targetId){
        const safeDataId = toSafeId(dataId)
        const safeTargetId = toSafeId(targetId)
        // jankkkk
        const isPrimaryIndex =  this.primaryIdentifier === partialId
        if (!isPrimaryIndex && !this.maintainSecondaryIndex) throw new Error(CONSTANTS.ERROR_INVALID_OPERATION)
        const isMultiple = isPrimaryIndex ? this.primaryMultiple : this.secondaryMultiple
        this._addRelation(partialId, isMultiple, safeDataId, safeTargetId)
        // Echo the update if we're maintaining secondary index or this was a secondary update going to primary
        if (this.maintainSecondaryIndex || !isPrimaryIndex){
            this._addRelation(this.secondaryIdentifier, this.secondaryMultiple, safeSid, safePid)
        }
    }
    _addRelation(partialId, isMultiple, dataId, targetValue){
        const partialIndex = this[partialId]
        if (!partialIndex) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
        if (!partialIndex.hasOwnProperty(dataId)){
            if (isMultiple){
                partialIndex[dataId] = new Set()
            } else {
                partialIndex[dataId] = ""
            }
        }
        if (isMultiple){
            // Index can hold multiple matching values
            if (Array.isArray(targetValue) || targetValue instanceof Set){
                // Incoming data can be an array or a set. Destructure to cast to array then insert individually
                [...targetValue].map(target => partialIndex[dataId].add(target))
            } else {
                // Otherwise it's a primitive. Just add the single value
                partialIndex[dataId].add(targetValue)
            }
        } else {
            // Index can hold a single value. Expect incoming data to be a single value
            partialIndex[dataId] = targetValue
        }
        
        console.log(`[${this.getAccessField()}] Relation added for ${partialId} - ${dataId}.`)
    }
    hasRelation(partialId, id){
        const partialIndex = this[partialId]
        if (!partialIndex) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
        return typeof id === "string" && typeof partialIndex[toSafeId(id)] !== "undefined"
    }
    setRelations(partialId, dataId, targetValue){
        const partialIndex = this[partialId]
        if (!partialIndex) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
        delete partialIndex[dataId]
        // BUG: how to handle secondary index update? smart ripple? scrap and build new index each time?
        // How to even identify primary status? factor out the "detector" method and use it here?
        if (Array.isArray(targetValue) || targetValue instanceof Set){
            [...targetValue].forEach(target => this.addRelations(partialId, dataId, target))
        } else {
            this.addRelations(partialId, dataId, targetValue)
        }
    }
    getAccessField(){
        return `${CONSTANTS.RELATION_KEY_PREFIX}${this.accessFieldSuffix}`
    }
    dump(){
        return this.read(this.primaryIdentifier, null, true)
    }
}

class PerfsToWorksRelation extends Relation {
    primaryIdentifier = CONSTANTS.PERFORMERS
    secondaryIdentifier = CONSTANTS.WORKS
    primaryMultiple = true
    secondaryMultiple = true
    maintainSecondaryIndex = true
    accessFieldSuffix = "perfworks"
}

module.exports = {
    Relation,
    PerfsToWorksRelation
}
