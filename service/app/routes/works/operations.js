const persistence = require('../../persistence')
const { scanDirectory } = require('../../filesystem')
const { generateCachePartialFromList } = require('../../model')
const { jsonWrap, jsonWrapErr } = require('../../protocol')

const CONSTANTS = require('../../const')

const rel = (req, res) => {
    
}

const performScan = async (req, res) => {
    console.log('in perform scan')
    // Scan filesystem
    const scanned = await scanDirectory()
    // Generate cache partial from the scanned files list
    const cachePartial = generateCachePartialFromList(scanned)
    // Grab works cache and read all entries from it
    const works = persistence.list(CONSTANTS.WORKS)

    const newFiles = {}
    const updatedFiles = {}
    const removedIds = []
    for (let [id, entry] of Object.entries(cachePartial)){
        if (works[id]){
            const updatedKeys = Object.keys(works[id]).filter(key => works[id][key] !== entry[key])
            const updatedValues =  updatedKeys.reduce((updated, key) => {
                updated[key] = entry[key]
                return updated
            }, {})
            if (Object.keys(updatedValues).length > 0){
                updatedFiles[id] = updatedValues
            }
        } else {
            newFiles[id] = entry
        }
    }
    for (let id of Object.keys(works)){
        if (!cachePartial[id]){
            removedIds.push(id)
        }
    }
    res.json(jsonWrap({
        new: newFiles,
        updated: updatedFiles,
        removed: removedIds
    }))
}

module.exports = {
    rel,
    performScan
}
