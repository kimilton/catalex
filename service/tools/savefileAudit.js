const { argv } = require('process')
const { loadFromFile } = require('../app/filesystem')
const { initializePrimeCache, convertPrimeCacheToRaw } = require('../app/persistence')

const IDS_PER_LINE = 4

const main = async () => {
    const showDetail = argv.length > 2 && argv[2] === "-d"
    console.log('Auditing savefile.')

    const [ loaded, fileLoadError ] = await loadFromFile()
    if (fileLoadError) {
        console.error(fileLoadError)
        return
    }

    const report = {}
    await initializePrimeCache(loaded)
    const rawCache = convertPrimeCacheToRaw()

    Object.keys(rawCache).map(key => {
        const cache = rawCache[key]
        const keys = Object.keys(cache)
        const keysLength = keys.length
        const subReport = {}
        subReport["numberOfKeys"] = keysLength
        if (showDetail && keysLength > 0){
            let shown = 0
            subReport["singleEntry"] = cache[keys[0]]
            subReport["allKeys"] = []
            while (shown < keysLength){
                let limit = Math.min(shown + IDS_PER_LINE, keysLength)
                subReport["allKeys"].push(keys.slice(shown, limit))
                shown = limit
            }
        }
        report[key] = subReport
    })
    for (const [reportKey, subReport] of Object.entries(report)){
        console.log(`[${reportKey}]`)
        for (let key of Object.keys(subReport)){
            if (key === "allKeys"){
                subReport[key].map(values => console.log(values))
            } else {
                console.log(`${key}:`)
                console.log(subReport[key])
            }
        }
        console.log('')
    }
}

(async () => {
    await main()
})()

