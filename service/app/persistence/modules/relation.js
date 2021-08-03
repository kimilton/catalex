
const cloneDeep = require('lodash/cloneDeep')

const CONSTANTS = require('../../const')

class Relation {
    primaryIdentifier
    secondaryIdentifier
    primaryMultiple
    secondaryMultiple
    maintainSecondaryIndex = false
    accessFieldSuffix

    // This is needed because constructors can't handle reading of field values
    init(){
        const REQ_FIELDS = [
            this.primaryIdentifier,
            this.secondaryIdentifier,
            this.primaryMultiple,
            this.secondaryMultiple,
            this.accessFieldSuffix
        ]
        // Make sure the inheriting class sets all required field values
        if (REQ_FIELDS.some(v => typeof v === "undefined")) throw new Error(CONSTANTS.ERROR_UNIMPLEMENTED)
        this[this.primaryIdentifier] = {}
        this[this.secondaryIdentifier] = {}
    }
    read(partialId, id, wrap){
        let partialIndex = this[partialId]
        if (!partialIndex) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
        let content = partialIndex
        if (id && partialIndex[id]){
            content = partialIndex[id]
        }
        let cloned = cloneDeep(content)
        cloned = this._recurseAndPrep(cloned)
        if (wrap){
            const accessField = this.getAccessField()
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
        console.log(`[${this.getAccessField()}] ${buildPrimaryFromSecondary ? 'Primary' : 'Secondary'} relation index has started building`)
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
        console.log(`[${this.getAccessField()}] ${buildPrimaryFromSecondary ? 'Primary' : 'Secondary'} relation index built successfully\n`)
    }
    // This method sets values 1:1. For 1:x, use setRelations()
    addRelations(partialId, dataId, targetId){
        const isPrimaryIndex =  this._isPartialPrimary(partialId)
        if (!isPrimaryIndex && !this.maintainSecondaryIndex) throw new Error(CONSTANTS.ERROR_INVALID_OPERATION)
        const isMultiple = isPrimaryIndex ? this.primaryMultiple : this.secondaryMultiple
        this._addRelation(partialId, isMultiple, dataId, targetId)
        // Echo the update if we're maintaining secondary index or this was a secondary update going to primary
        if (this.maintainSecondaryIndex || !isPrimaryIndex){
            this._addRelation(this.secondaryIdentifier, this.secondaryMultiple, targetId, dataId)
        }
    }
    _addRelation(partialId, isMultiple, dataId, targetValue){
        const partialIndex = this._validateAndGetPartial(partialId)
        if (!this.hasRelation(partialId, dataId)){
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
    hasRelation(partialId, dataId){
        const partialIndex = this._validateAndGetPartial(partialId)
        return typeof dataId === "string" && typeof partialIndex[dataId] !== "undefined"
    }
    setRelations(partialId, dataId, targetValue){
        const partialIndex = this._validateAndGetPartial(partialId)
        // const previousValue = partialIndex[dataId]
        delete partialIndex[dataId]

        // Adding operation depends on the pluraity of targetValue
        if (Array.isArray(targetValue) || targetValue instanceof Set){
            [...targetValue].forEach(target => this.addRelations(partialId, dataId, target))
        } else {
            this.addRelations(partialId, dataId, targetValue)
        }
    }
    getAccessField(){
        return `${CONSTANTS.RELATION_KEY_PREFIX}${this.accessFieldSuffix}`
    }
    _isPartialPrimary(partialId){
        this._validatePartialId(partialId)
        return partialId === this.primaryIdentifier
    }
    _validatePartialId(partialId){
        const validIds = [this.primaryIdentifier, this.secondaryIdentifier]
        if (!validIds.includes(partialId)) throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
        return true
    }
    _validateAndGetPartial(partialId){
        this._validatePartialId(partialId)
        const partialIndex = this[partialId]
        if (typeof partialIndex === 'undefined') throw new Error(CONSTANTS.ERROR_UNKNOWN_PARTIAL)
        return partialIndex
    }
    _recurseAndPrep(branch){
        // Recurse and turn all instances of Set into arrays
        if (branch instanceof Set){
            return [...branch]
        } else if (Object.keys(branch).length){
            return Object.keys(branch).reduce((obj, childKey) => ({...obj, [childKey]: this._recurseAndPrep(branch[childKey])}), {})
        }
        return branch
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
