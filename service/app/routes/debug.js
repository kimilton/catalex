const { convertPrimeCacheToRaw } = require('../persistence')
const { jsonWrap, jsonWrapErr } = require('../protocol')

const IDS_PER_LINE = 4
const MAX_LINES = 20

const debugEndpoint = (req, res) => {
    const report = {}
    const rawCache = convertPrimeCacheToRaw()
    Object.keys(rawCache).map(key => {
        const cache = rawCache[key]
        const keys = Object.keys(cache)
        const keysLength = keys.length
        const subReport = {}
        subReport["numberOfKeys"] = keysLength
        if (keysLength > 0){
            let shown = 0
            subReport["singleEntry"] = cache[keys[0]]
            subReport["keys"] = []
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
