const { convertPrimeCacheToRaw } = require('../persistence')
const { jsonWrap, jsonWrapErr } = require('../protocol')

const debugEndpoint = (req, res) => {
    let report = {}
    const contents = convertPrimeCacheToRaw()
    Object.keys(contents).forEach(key => {
        let count = "N/A"
        if (contents[key]){
            count = Object.keys(contents[key]).length
        }
        report[key] = count
    })
    res.json(jsonWrap(report))
}

module.exports = {
    debugEndpoint
}
