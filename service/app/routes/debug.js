const persistence = require('../persistence')
const { jsonWrap, jsonWrapErr } = require('../protocol')

const IDS_PER_LINE = 4
const MAX_LINES = 10

const debugEndpoint = (req, res) => {
    const report = {}
    const stateDump = persistence.getPersistanceStateDump()
    Object.keys(stateDump).map(key => {
        const cache = stateDump[key]
        const keys = Object.keys(cache)
        const keysLength = keys.length
        const subReport = {}
        if (keysLength > 0){
            let shown = 0
            subReport["partials"] = {}
            subReport["numberOfKeys"] = keysLength
            subReport["keys"] = []
            subReport["singleEntry"] = {[keys[0]]: cache[keys[0]]}
            while (shown < keysLength && shown < IDS_PER_LINE * MAX_LINES){
                let limit = Math.min(shown + IDS_PER_LINE, keysLength)
                subReport["keys"].push(keys.slice(shown, limit))
                shown = limit
            }
        }
        report[key] = subReport
    })
    res.json(jsonWrap(report))
}

module.exports = {
    debugEndpoint
}
