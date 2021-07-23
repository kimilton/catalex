const { toSafeId } = require('../index')
const CONSTANTS = require('../../const')

class Relation {
    primary
    secondary
    primaryMultiple
    secondaryMultiple
    constructor(){
        this.pToS = {}
        this.sToP = {}
    }
    addRelations(pid, sid){
        const safePid = toSafeId(pid)
        const safeSid = toSafeId(sid)
        if (!this.pToS.hasOwnProperty(safePid)){
            this.pToS[safePid] = {}
            if (this.primaryMultiple) this.pToS[safePid][CONSTANTS.MULTI_KEY] = new Set()
        }
        if (!this.sToP.hasOwnProperty(safeSid)){
            this.sToP[safeSid] = {}
            if (this.secondaryMultiple) this.sToP[safeSid][CONSTANTS.MULTI_KEY] = new Set()
        }
        this.pToS[safePid][safeSid] = true
        this.sToP[safeSid][safePid] = true
        if (this.primaryMultiple) this.pToS[safePid][CONSTANTS.MULTI_KEY].add(safeSid)
        if (this.secondaryMultiple) this.sToP[safeSid][CONSTANTS.MULTI_KEY].add(safePid)
    }
    getId(){
        return `${this.primary}${CONSTANTS.RELATION_SEPARATOR}${this.secondary}`
    }
    toRaw(){
        try{
            return [{
                [this.primary]: JSON.stringify(this.pToS),
                [this.secondary]: JSON.stringify(this.sToP),
            }, null]
        } catch (err){
            return [null, err.toString()]
        }
    }
}

class PerfsToWorksRelation extends Relation {
    primary = CONSTANTS.PERFORMERS
    secondary = CONSTANTS.WORKS
    primaryMultiple = true
    secondaryMultiple = true
}

module.exports = {
    PerfsToWorksRelation
}
