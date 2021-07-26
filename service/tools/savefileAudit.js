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

    await initializePrimeCache(loaded)
    const rawCache = convertPrimeCacheToRaw()

    Object.keys(rawCache).map(key => {
        const cache = rawCache[key]
        const keys = Object.keys(cache)
        const keysLength = keys.length
        console.log(`[${key}] ${keysLength} entries found.`)
        if (showDetail && keysLength > 0){
            let shown = 0
            console.dir(cache[keys[0]])
            while (shown < keysLength){
                let limit = Math.min(shown + IDS_PER_LINE, keysLength)
                console.log(keys.slice(shown, limit))
                shown = limit
            }
        }
    })
}

(async () => {
    await main()
})()

