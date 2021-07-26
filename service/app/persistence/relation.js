
const cloneDeep = require('lodash/cloneDeep')
const freezeDeep = require('deep-freeze-node');

const { toSafeId } = require('../model')
const CONSTANTS = require('../const')

class Relation {
    relationIdentifier
    primary
    secondary
    primaryMultiple
    secondaryMultiple
    maintainSecondaryIndex
    static relationIdentifier
    
    constructor(){
        this.pToS = {}
        this.sToP = {}
    }
    read(){
        const cloned = cloneDeep(this.pToS)
        return freezeDeep(cloned)
    }
    importCache(data){
        const id = this.relationIdentifier
        let relCache = {}
        if (data.hasOwnProperty(id)){
            relCache = cloneDeep(data[id])
        }
        this.pToS = relCache
        if (this.maintainSecondaryIndex){
            // Build the secondary index here and now
        }
    }
    addRelations(pid, sid){
        const safePid = toSafeId(pid)
        if (!this.pToS.hasOwnProperty(safePid)){
            if (this.primaryMultiple){
                this.pToS[safePid][CONSTANTS.MULTI_KEY] = new Set()
            } else {
                this.pToS[safePid] = {}
            }
        }
        if (this.primaryMultiple){
            this.pToS[safePid][CONSTANTS.MULTI_KEY].add(safeSid)
        } else {
            this.pToS[safePid][safeSid] = true
        }

        // Update secondary index at the same time
        if (this.maintainSecondaryIndex){
            const safeSid = toSafeId(sid)
            if (!this.sToP.hasOwnProperty(safeSid)){
                if (this.secondaryMultiple) {
                    this.sToP[safeSid][CONSTANTS.MULTI_KEY] = new Set()
                } else {
                    this.sToP[safeSid] = {}
                }
            }
            if (this.secondaryMultiple) {
                this.sToP[safeSid][CONSTANTS.MULTI_KEY].add(safePid)
            } else {
                this.sToP[safeSid][safePid] = true
            }
        }
    }
}

class PerfsToWorksRelation extends Relation {
    primary = CONSTANTS.PERFORMERS
    secondary = CONSTANTS.WORKS
    primaryMultiple = true
    secondaryMultiple = true
    maintainSecondaryIndex = true
    static relationIdentifier = `${CONSTANTS.PERFORMERS}${CONSTANTS.RELATION_SEPARATOR}${CONSTANTS.WORKS}`
}

module.exports = {
    PerfsToWorksRelation
}
